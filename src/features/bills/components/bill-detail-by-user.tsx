"use client";

import { formatRupiah } from "../lib/calculations";
import { ITEM_TYPES } from "../lib/item-types";
import type { PerUserBreakdown } from "../lib/breakdown";

function typeLabel(type: string): string {
  switch (type) {
    case ITEM_TYPES.TAX:
      return "Tax";
    case ITEM_TYPES.SERVICE_CHARGE:
      return "Service";
    case ITEM_TYPES.ADDITIONAL:
      return "Additional";
    default:
      return "";
  }
}

type Props = {
  users: PerUserBreakdown[];
};

export function BillDetailByUser({ users }: Props) {
  if (users.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">No user data.</p>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.userName}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                {user.userName[0].toUpperCase()}
              </div>
              <span className="font-semibold text-gray-900">
                {user.userName}
              </span>
            </div>
            <span className="font-bold text-emerald-700">
              {formatRupiah(user.total)}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {user.lines.map((line, idx) => {
              const isCharge = line.type !== ITEM_TYPES.ITEM;
              const isDiscount = isCharge && line.share < 0;
              return (
                <div
                  key={`${line.itemId}-${idx}`}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-gray-700">{line.itemName}</span>
                    {isCharge && (
                      <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                        {isDiscount ? "discount" : typeLabel(line.type).toLowerCase()}
                      </span>
                    )}
                  </div>
                  <span
                    className={
                      isDiscount
                        ? "ml-4 shrink-0 text-red-600"
                        : "ml-4 shrink-0 text-gray-800"
                    }
                  >
                    {isDiscount
                      ? `−${formatRupiah(-line.share)}`
                      : formatRupiah(line.share)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
