"use client";

import { formatRupiah } from "../lib/calculations";
import { ITEM_TYPES } from "../lib/item-types";
import type { PerItemBreakdown } from "../lib/breakdown";

type Props = {
  items: PerItemBreakdown[];
};

const TYPE_LABELS: Record<string, string> = {
  [ITEM_TYPES.ITEM]: "Item",
  [ITEM_TYPES.TAX]: "Tax",
  [ITEM_TYPES.SERVICE_CHARGE]: "Service",
  [ITEM_TYPES.ADDITIONAL]: "Additional",
};

const TYPE_COLORS: Record<string, string> = {
  [ITEM_TYPES.ITEM]: "bg-blue-50 text-blue-700",
  [ITEM_TYPES.TAX]: "bg-amber-50 text-amber-700",
  [ITEM_TYPES.SERVICE_CHARGE]: "bg-purple-50 text-purple-700",
  [ITEM_TYPES.ADDITIONAL]: "bg-gray-100 text-gray-600",
};

export function BillDetailByItem({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">No items found.</p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isDiscount = item.total < 0;
        return (
          <div
            key={item.itemId}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    TYPE_COLORS[item.type] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {TYPE_LABELS[item.type] ?? item.type}
                </span>
                <span className="truncate font-medium text-gray-900">
                  {item.itemName}
                </span>
              </div>
              <span
                className={`shrink-0 ml-3 font-semibold ${
                  isDiscount ? "text-red-600" : "text-gray-900"
                }`}
              >
                {isDiscount
                  ? `−${formatRupiah(-item.total)}`
                  : formatRupiah(item.total)}
              </span>
            </div>

            {item.shares.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {item.shares.map((s) => (
                    <div
                      key={s.userName}
                      className="flex items-center gap-1.5 text-sm"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-gray-600">{s.userName}</span>
                      <span className="text-gray-400">
                        {isDiscount
                          ? `−${formatRupiah(-s.share)}`
                          : formatRupiah(s.share)}
                      </span>
                    </div>
                  ))}
                </div>
                {item.shares.length > 1 && (
                  <p className="mt-1 text-xs text-gray-400">
                    {item.type === ITEM_TYPES.ITEM
                      ? `Split equally · ${formatRupiah(Math.abs(item.perPersonShare ?? 0))} each`
                      : "Split proportionally to each person's items"}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
