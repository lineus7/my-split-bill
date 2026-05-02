"use client";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type { AdditionalChargeDraft } from "../types";

type Props = {
  charge: AdditionalChargeDraft;
  onUpdate: (patch: Partial<Omit<AdditionalChargeDraft, "id">>) => void;
  onRemove: () => void;
};

export function AdditionalChargeRow({ charge, onUpdate, onRemove }: Props) {
  return (
    <div className="flex items-end gap-2 rounded-lg border border-gray-200 p-3">
      <div className="flex-1">
        <Input
          label="Description"
          value={charge.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="e.g. Promo discount"
        />
      </div>
      <div className="mb-1 flex overflow-hidden rounded-lg border border-gray-200">
        {(["CHARGE", "DISCOUNT"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => onUpdate({ kind })}
            className={cn(
              "px-3 py-2 text-sm font-medium transition",
              charge.kind === kind
                ? kind === "CHARGE"
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {kind === "CHARGE" ? "+ Charge" : "− Discount"}
          </button>
        ))}
      </div>
      <div className="w-32">
        <Input
          label="Amount"
          type="number"
          min={0}
          value={charge.amount}
          onChange={(e) =>
            onUpdate({ amount: Math.max(0, parseFloat(e.target.value) || 0) })
          }
          placeholder="0"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          "text-gray-400 transition hover:bg-red-50 hover:text-red-500"
        )}
        aria-label="Remove charge"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
