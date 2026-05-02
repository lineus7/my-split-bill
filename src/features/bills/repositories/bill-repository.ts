import { eq } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema/transactions";
import { transactionItems } from "@/db/schema/transaction-items";
import { transactionItemAddOns } from "@/db/schema/transaction-item-add-ons";
import { transactionItemUsers } from "@/db/schema/transaction-item-users";
import { transactionStatuses } from "@/db/schema/transaction-statuses";
import { transactionItemTypes } from "@/db/schema/transaction-item-types";
import type { CreateBillData } from "../schemas/create-bill-schema";

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
