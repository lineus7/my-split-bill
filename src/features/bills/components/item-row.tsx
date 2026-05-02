"use client";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type { AddOnDraft, ItemDraft } from "../types";
import { AddOnRow } from "./add-on-row";

type Props = {
  item: ItemDraft;
  index: number;
  onUpdate: (patch: Partial<Omit<ItemDraft, "id" | "addOns">>) => void;
  onRemove: () => void;
  onAddAddOn: () => void;
  onUpdateAddOn: (addOnId: string, patch: Partial<Omit<AddOnDraft, "id">>) => void;
  onRemoveAddOn: (addOnId: string) => void;
};

export function ItemRow({
  item,
  index,
  onUpdate,
  onRemove,
  onAddAddOn,
  onUpdateAddOn,
  onRemoveAddOn,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">
          Item {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            "text-gray-400 transition hover:bg-red-50 hover:text-red-500"
          )}
          aria-label="Remove item"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            label="Item name"
            value={item.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g. Nasi Goreng"
          />
        </div>
        <div className="w-20">
          <Input
            label="Qty"
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) =>
              onUpdate({ quantity: Math.max(1, parseInt(e.target.value) || 1) })
            }
          />
        </div>
        <div className="w-32">
          <Input
            label="Price"
            type="number"
            min={0}
            value={item.price}
            onChange={(e) =>
              onUpdate({ price: Math.max(0, parseFloat(e.target.value) || 0) })
            }
            placeholder="0"
          />
        </div>
      </div>

      {item.addOns.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-gray-400">Add-ons</p>
          {item.addOns.map((addOn) => (
            <AddOnRow
              key={addOn.id}
              addOn={addOn}
              onUpdate={(patch) => onUpdateAddOn(addOn.id, patch)}
              onRemove={() => onRemoveAddOn(addOn.id)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAddAddOn}
        className="mt-3 flex items-center gap-1 text-sm text-emerald-600 transition hover:text-emerald-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add add-on
      </button>
    </div>
  );
}
