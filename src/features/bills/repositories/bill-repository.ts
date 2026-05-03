import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema/transactions";
import { transactionItems } from "@/db/schema/transaction-items";
import { transactionItemAddOns } from "@/db/schema/transaction-item-add-ons";
import { transactionItemUsers } from "@/db/schema/transaction-item-users";
import { transactionStatuses } from "@/db/schema/transaction-statuses";
import { transactionItemTypes } from "@/db/schema/transaction-item-types";
import type { CreateBillData } from "../schemas/create-bill-schema";
import type { BillDetail, BillListItem } from "../types";
import { ITEM_TYPES, type ItemTypeName } from "../lib/item-types";

let cachedTypeIdMap: Record<string, string> | null = null;
let cachedOpenStatusId: string | null = null;

export async function getItemTypeIdMap(): Promise<Record<string, string>> {
  if (cachedTypeIdMap) return cachedTypeIdMap;
  const rows = await db
    .select({ type: transactionItemTypes.type, id: transactionItemTypes.id })
    .from(transactionItemTypes);
  const map: Record<string, string> = {};
  for (const row of rows) map[row.type] = row.id;
  cachedTypeIdMap = map;
  return map;
}

export async function getOpenStatusId(): Promise<string> {
  if (cachedOpenStatusId) return cachedOpenStatusId;
  const row = await db
    .select({ id: transactionStatuses.id })
    .from(transactionStatuses)
    .where(eq(transactionStatuses.status, "OPEN"))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!row) throw new Error("OPEN status not found in database");
  cachedOpenStatusId = row.id;
  return row.id;
}

export async function createBillWithSplit(
  userId: string,
  data: CreateBillData
): Promise<{ id: string }> {
  const [statusId, typeIdMap] = await Promise.all([
    getOpenStatusId(),
    getItemTypeIdMap(),
  ]);

  const allCustomers = data.customers;

  return await db.transaction(async (tx) => {
    const [transaction] = await tx
      .insert(transactions)
      .values({ userId, statusId, title: data.title })
      .returning({ id: transactions.id });

    const transactionId = transaction.id;

    for (const item of data.items) {
      const [dbItem] = await tx
        .insert(transactionItems)
        .values({
          transactionId,
          typeId: typeIdMap["ITEM"],
          itemName: item.name,
          price: String(item.price),
          quantity: item.quantity,
        })
        .returning({ id: transactionItems.id });

      if (item.addOns.length > 0) {
        await tx.insert(transactionItemAddOns).values(
          item.addOns.map((a) => ({
            transactionItemId: dbItem.id,
            itemName: a.name,
            price: String(a.price),
            quantity: a.quantity,
          }))
        );
      }

      const assignedCustomers = allCustomers.filter((c) =>
        c.itemIds.includes(item.id)
      );
      if (assignedCustomers.length > 0) {
        await tx.insert(transactionItemUsers).values(
          assignedCustomers.map((c) => ({
            transactionItemId: dbItem.id,
            displayName: c.name.trim(),
          }))
        );
      }
    }

    const chargeRows: Array<{
      typeKey: string;
      name: string;
      price: number;
    }> = [];

    if (data.taxAmount > 0) {
      chargeRows.push({ typeKey: "TAX", name: "Tax", price: data.taxAmount });
    }
    if (data.serviceAmount > 0) {
      chargeRows.push({
        typeKey: "SERVICE_CHARGE",
        name: "Service Charge",
        price: data.serviceAmount,
      });
    }
    for (const charge of data.additionalCharges) {
      chargeRows.push({
        typeKey: "ADDITIONAL",
        name: charge.name,
        price: charge.kind === "DISCOUNT" ? -charge.amount : charge.amount,
      });
    }

    for (const charge of chargeRows) {
      const [dbCharge] = await tx
        .insert(transactionItems)
        .values({
          transactionId,
          typeId: typeIdMap[charge.typeKey],
          itemName: charge.name,
          price: String(charge.price),
          quantity: 1,
        })
        .returning({ id: transactionItems.id });

      await tx.insert(transactionItemUsers).values(
        allCustomers.map((c) => ({
          transactionItemId: dbCharge.id,
          displayName: c.name.trim(),
        }))
      );
    }

    return { id: transactionId };
  });
}

export async function findBillsByUserId(
  userId: string
): Promise<BillListItem[]> {
  const rows = await db
    .select({
      id: transactions.id,
      title: transactions.title,
      createdAt: transactions.createdAt,
      status: transactionStatuses.status,
    })
    .from(transactions)
    .innerJoin(
      transactionStatuses,
      eq(transactions.statusId, transactionStatuses.id)
    )
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt));

  if (rows.length === 0) return [];

  const billIds = rows.map((r) => r.id);

  const itemRows = await db
    .select({
      id: transactionItems.id,
      transactionId: transactionItems.transactionId,
      price: transactionItems.price,
      quantity: transactionItems.quantity,
      type: transactionItemTypes.type,
    })
    .from(transactionItems)
    .innerJoin(
      transactionItemTypes,
      eq(transactionItems.typeId, transactionItemTypes.id)
    )
    .where(inArray(transactionItems.transactionId, billIds));

  const itemIds = itemRows.map((r) => r.id);
  const addOnRows =
    itemIds.length > 0
      ? await db
          .select({
            transactionItemId: transactionItemAddOns.transactionItemId,
            price: transactionItemAddOns.price,
            quantity: transactionItemAddOns.quantity,
          })
          .from(transactionItemAddOns)
          .where(inArray(transactionItemAddOns.transactionItemId, itemIds))
      : [];

  const addOnsByItemId = new Map<string, { price: number; quantity: number }[]>();
  for (const a of addOnRows) {
    const list = addOnsByItemId.get(a.transactionItemId) ?? [];
    list.push({ price: Number(a.price), quantity: a.quantity });
    addOnsByItemId.set(a.transactionItemId, list);
  }

  const totalsByBillId = new Map<string, number>();
  const itemCountByBillId = new Map<string, number>();
  for (const item of itemRows) {
    const itemTotal =
      Number(item.price) * item.quantity +
      (addOnsByItemId.get(item.id) ?? []).reduce(
        (s, a) => s + a.price * a.quantity,
        0
      );
    totalsByBillId.set(
      item.transactionId,
      (totalsByBillId.get(item.transactionId) ?? 0) + itemTotal
    );
    if (item.type === ITEM_TYPES.ITEM) {
      itemCountByBillId.set(
        item.transactionId,
        (itemCountByBillId.get(item.transactionId) ?? 0) + 1
      );
    }
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    createdAt: row.createdAt,
    total: totalsByBillId.get(row.id) ?? 0,
    itemCount: itemCountByBillId.get(row.id) ?? 0,
  }));
}

export async function findBillByIdWithDetails(
  billId: string
): Promise<BillDetail | null> {
  const billRow = await db
    .select({
      id: transactions.id,
      title: transactions.title,
      createdAt: transactions.createdAt,
      userId: transactions.userId,
      status: transactionStatuses.status,
    })
    .from(transactions)
    .innerJoin(
      transactionStatuses,
      eq(transactions.statusId, transactionStatuses.id)
    )
    .where(eq(transactions.id, billId))
    .limit(1)
    .then((r) => r[0] ?? null);

  if (!billRow) return null;

  const itemRows = await db
    .select({
      id: transactionItems.id,
      itemName: transactionItems.itemName,
      price: transactionItems.price,
      quantity: transactionItems.quantity,
      type: transactionItemTypes.type,
      createdAt: transactionItems.createdAt,
    })
    .from(transactionItems)
    .innerJoin(
      transactionItemTypes,
      eq(transactionItems.typeId, transactionItemTypes.id)
    )
    .where(eq(transactionItems.transactionId, billId))
    .orderBy(transactionItems.createdAt);

  const itemIds = itemRows.map((r) => r.id);

  const [addOnRows, userRows] = await Promise.all([
    itemIds.length > 0
      ? db
          .select({
            id: transactionItemAddOns.id,
            transactionItemId: transactionItemAddOns.transactionItemId,
            itemName: transactionItemAddOns.itemName,
            price: transactionItemAddOns.price,
            quantity: transactionItemAddOns.quantity,
          })
          .from(transactionItemAddOns)
          .where(inArray(transactionItemAddOns.transactionItemId, itemIds))
      : Promise.resolve([]),
    itemIds.length > 0
      ? db
          .select({
            id: transactionItemUsers.id,
            transactionItemId: transactionItemUsers.transactionItemId,
            displayName: transactionItemUsers.displayName,
          })
          .from(transactionItemUsers)
          .where(inArray(transactionItemUsers.transactionItemId, itemIds))
      : Promise.resolve([]),
  ]);

  const addOnsByItemId = new Map<
    string,
    { id: string; name: string; price: number; quantity: number }[]
  >();
  for (const a of addOnRows) {
    const list = addOnsByItemId.get(a.transactionItemId) ?? [];
    list.push({
      id: a.id,
      name: a.itemName,
      price: Number(a.price),
      quantity: a.quantity,
    });
    addOnsByItemId.set(a.transactionItemId, list);
  }

  const usersByItemId = new Map<
    string,
    { id: string; displayName: string }[]
  >();
  for (const u of userRows) {
    const list = usersByItemId.get(u.transactionItemId) ?? [];
    list.push({ id: u.id, displayName: u.displayName });
    usersByItemId.set(u.transactionItemId, list);
  }

  return {
    id: billRow.id,
    title: billRow.title,
    status: billRow.status,
    createdAt: billRow.createdAt,
    ownerId: billRow.userId,
    items: itemRows.map((item) => ({
      id: item.id,
      name: item.itemName,
      type: item.type as ItemTypeName,
      price: Number(item.price),
      quantity: item.quantity,
      addOns: addOnsByItemId.get(item.id) ?? [],
      users: usersByItemId.get(item.id) ?? [],
    })),
  };
}
