import type { AdditionalChargeDraft, ItemDraft } from "../types";

export function calcItemSubtotal(item: ItemDraft): number {
  const base = item.price * item.quantity;
  const addOns = item.addOns.reduce((s, a) => s + a.price * a.quantity, 0);
  return base + addOns;
}

export function calcSubtotal(items: ItemDraft[]): number {
  return items.reduce((s, item) => s + calcItemSubtotal(item), 0);
}

export function calcAdditionalNet(charges: AdditionalChargeDraft[]): number {
  return charges.reduce(
    (s, c) => s + (c.kind === "DISCOUNT" ? -c.amount : c.amount),
    0
  );
}

export function calcGrandTotal(
  items: ItemDraft[],
  taxAmount: number,
  serviceAmount: number,
  additionalCharges: AdditionalChargeDraft[]
): number {
  return (
    calcSubtotal(items) +
    taxAmount +
    serviceAmount +
    calcAdditionalNet(additionalCharges)
  );
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
