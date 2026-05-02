"use client";

import {
  calcAdditionalNet,
  calcGrandTotal,
  calcSubtotal,
  formatRupiah,
} from "../lib/calculations";
import type { AdditionalChargeDraft, ItemDraft } from "../types";

type Props = {
  items: ItemDraft[];
  taxAmount: number;
  serviceAmount: number;
  additionalCharges: AdditionalChargeDraft[];
};

export function BillSummary({
  items,
  taxAmount,
  serviceAmount,
  additionalCharges,
}: Props) {
  const subtotal = calcSubtotal(items);
  const additionalNet = calcAdditionalNet(additionalCharges);
  const total = calcGrandTotal(items, taxAmount, serviceAmount, additionalCharges);

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-emerald-800">Summary</h3>
      <div className="space-y-1.5 text-sm">
        <Row label="Subtotal" value={subtotal} />
        {taxAmount > 0 && <Row label="Tax" value={taxAmount} />}
        {serviceAmount > 0 && (
          <Row label="Service Charge" value={serviceAmount} />
        )}
        {additionalCharges.map((c) => (
          <Row
            key={c.id}
            label={c.name || (c.kind === "DISCOUNT" ? "Discount" : "Additional")}
            value={c.kind === "DISCOUNT" ? -c.amount : c.amount}
          />
        ))}
        <div className="my-2 border-t border-emerald-200" />
        <div className="flex items-center justify-between font-semibold text-emerald-900">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  const isNegative = value < 0;
  return (
    <div className="flex items-center justify-between text-gray-700">
      <span>{label}</span>
      <span className={isNegative ? "text-red-600" : ""}>
        {isNegative ? `−${formatRupiah(-value)}` : formatRupiah(value)}
      </span>
    </div>
  );
}
