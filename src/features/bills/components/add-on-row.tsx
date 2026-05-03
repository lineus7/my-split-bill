"use client";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type { AddOnDraft } from "../types";

type Props = {
  addOn: AddOnDraft;
  onUpdate: (patch: Partial<Omit<AddOnDraft, "id">>) => void;
  onRemove: () => void;
};

export function AddOnRow({ addOn, onUpdate, onRemove }: Props) {
  return (
    <div className="flex items-end gap-2 rounded-lg bg-gray-50 p-3">
      <div className="flex-1">
        <Input
          label="Add-on name"
          value={addOn.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="e.g. Extra sauce"
        />
      </div>
      <div className="w-20">
        <Input
          label="Qty"
          type="number"
          min={1}
          value={addOn.quantity}
          onChange={(e) =>
            onUpdate({ quantity: Math.max(1, parseInt(e.target.value) || 1) })
          }
        />
      </div>
      <div className="w-32">
        <Input
          label="Price"
          type="number"
          value={addOn.price}
          onChange={(e) =>
            onUpdate({ price: parseFloat(e.target.value) || 0 })
          }
          placeholder="0 (negative for discount)"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          "text-gray-400 transition hover:bg-red-50 hover:text-red-500"
        )}
        aria-label="Remove add-on"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
