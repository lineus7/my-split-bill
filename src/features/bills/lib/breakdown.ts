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
  perPersonShare: number;
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

export function buildPerItemBreakdown(bill: BillDetail): PerItemBreakdown[] {
  return bill.items.map((item) => {
    const total = calcDetailItemTotal(item);
    const userCount = item.users.length;
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
  });
}

export function buildPerUserBreakdown(bill: BillDetail): PerUserBreakdown[] {
  const byUser = new Map<string, UserShareLine[]>();

  for (const item of bill.items) {
    const total = calcDetailItemTotal(item);
    const userCount = item.users.length;
    if (userCount === 0) continue;
    const share = total / userCount;
    for (const u of item.users) {
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
