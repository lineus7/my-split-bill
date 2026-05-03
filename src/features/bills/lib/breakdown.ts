import type { BillDetail, BillDetailItem } from "../types";
import { ITEM_TYPES, type ItemTypeName } from "./item-types";

export type ItemShareEntry = {
  userName: string;
  share: number;
};

export type PerItemBreakdown = {
  itemId: string;
  itemName: string;
  type: ItemTypeName;
  total: number;
  perPersonShare: number | null;
  shares: ItemShareEntry[];
};

export type UserShareLine = {
  itemId: string;
  itemName: string;
  type: ItemTypeName;
  share: number;
};

export type PerUserBreakdown = {
  userName: string;
  lines: UserShareLine[];
  total: number;
};

export function calcDetailItemTotal(item: BillDetailItem): number {
  if (item.type === ITEM_TYPES.ITEM) {
    return (
      item.price * item.quantity +
      item.addOns.reduce((s, a) => s + a.price * a.quantity, 0)
    );
  }
  return item.price;
}

export function calcBillTotal(bill: BillDetail): number {
  return bill.items.reduce((s, item) => s + calcDetailItemTotal(item), 0);
}

function calcItemSubtotalsByUser(bill: BillDetail): Map<string, number> {
  const subtotals = new Map<string, number>();
  for (const item of bill.items) {
    if (item.type !== ITEM_TYPES.ITEM) continue;
    const total = calcDetailItemTotal(item);
    const userCount = item.users.length;
    if (userCount === 0) continue;
    const share = total / userCount;
    for (const u of item.users) {
      subtotals.set(u.displayName, (subtotals.get(u.displayName) ?? 0) + share);
    }
  }
  return subtotals;
}

function calcChargeShare(
  chargeTotal: number,
  userName: string,
  userCount: number,
  subtotalsByUser: Map<string, number>,
  totalItemSubtotal: number,
): number {
  if (totalItemSubtotal > 0) {
    const userItemSubtotal = subtotalsByUser.get(userName) ?? 0;
    return chargeTotal * (userItemSubtotal / totalItemSubtotal);
  }
  return chargeTotal / userCount;
}

export function buildPerItemBreakdown(bill: BillDetail): PerItemBreakdown[] {
  const subtotalsByUser = calcItemSubtotalsByUser(bill);
  const totalItemSubtotal = Array.from(subtotalsByUser.values()).reduce(
    (s, v) => s + v,
    0,
  );

  return bill.items.map((item) => {
    const total = calcDetailItemTotal(item);
    const userCount = item.users.length;

    if (item.type === ITEM_TYPES.ITEM) {
      const perPersonShare = userCount > 0 ? total / userCount : 0;
      return {
        itemId: item.id,
        itemName: item.name,
        type: item.type,
        total,
        perPersonShare,
        shares: item.users.map((u) => ({
          userName: u.displayName,
          share: perPersonShare,
        })),
      };
    }

    return {
      itemId: item.id,
      itemName: item.name,
      type: item.type,
      total,
      perPersonShare: null,
      shares: item.users.map((u) => ({
        userName: u.displayName,
        share: calcChargeShare(
          total,
          u.displayName,
          userCount,
          subtotalsByUser,
          totalItemSubtotal,
        ),
      })),
    };
  });
}

export function buildPerUserBreakdown(bill: BillDetail): PerUserBreakdown[] {
  const subtotalsByUser = calcItemSubtotalsByUser(bill);
  const totalItemSubtotal = Array.from(subtotalsByUser.values()).reduce(
    (s, v) => s + v,
    0,
  );

  const byUser = new Map<string, UserShareLine[]>();

  for (const item of bill.items) {
    const total = calcDetailItemTotal(item);
    const userCount = item.users.length;
    if (userCount === 0) continue;

    for (const u of item.users) {
      const share =
        item.type === ITEM_TYPES.ITEM
          ? total / userCount
          : calcChargeShare(
              total,
              u.displayName,
              userCount,
              subtotalsByUser,
              totalItemSubtotal,
            );

      const lines = byUser.get(u.displayName) ?? [];
      lines.push({
        itemId: item.id,
        itemName: item.name,
        type: item.type,
        share,
      });
      byUser.set(u.displayName, lines);
    }
  }

  return Array.from(byUser.entries())
    .map(([userName, lines]) => ({
      userName,
      lines,
      total: lines.reduce((s, l) => s + l.share, 0),
    }))
    .sort((a, b) => a.userName.localeCompare(b.userName));
}
