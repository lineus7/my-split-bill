"use client";

import { cn } from "@/shared/lib/utils";
import { formatRupiah, calcItemSubtotal } from "../lib/calculations";
import type { CustomerDraft, ItemDraft } from "../types";

type Props = {
  items: ItemDraft[];
  customers: CustomerDraft[];
  activeCustomer: CustomerDraft;
  onToggle: (itemId: string) => void;
};

export function ItemAssignmentChecklist({
  items,
  customers,
  activeCustomer,
  onToggle,
}: Props) {
  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">No items found.</p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const checked = activeCustomer.itemIds.includes(item.id);
        const sharingCount = customers.filter((c) =>
          c.itemIds.includes(item.id)
        ).length;
        const subtotal = calcItemSubtotal(item);

        return (
          <label
            key={item.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
              checked
                ? "border-emerald-400 bg-emerald-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(item.id)}
              className="mt-0.5 h-4 w-4 rounded accent-emerald-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-gray-800 truncate">
                  {item.name || "Unnamed item"}
                </span>
                <span className="shrink-0 text-sm font-medium text-gray-700">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                <span>
                  {formatRupiah(item.price)} × {item.quantity}
                </span>
                {item.addOns.length > 0 && (
                  <span>+ {item.addOns.length} add-on{item.addOns.length > 1 ? "s" : ""}</span>
                )}
              </div>
              {sharingCount > 0 && (
                <div className="mt-1 text-xs text-emerald-600">
                  Shared with {sharingCount} person{sharingCount > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
