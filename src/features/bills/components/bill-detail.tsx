"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { formatRupiah } from "../lib/calculations";
import { calcBillTotal, buildPerItemBreakdown, buildPerUserBreakdown } from "../lib/breakdown";
import type { BillDetail as BillDetailType } from "../types";
import { BillDetailByUser } from "./bill-detail-by-user";
import { BillDetailByItem } from "./bill-detail-by-item";

type View = "user" | "item";

type Props = {
  bill: BillDetailType;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function BillDetail({ bill }: Props) {
  const [view, setView] = useState<View>("user");

  const perUser = buildPerUserBreakdown(bill);
  const perItem = buildPerItemBreakdown(bill);
  const total = calcBillTotal(bill);

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white">
        <p className="text-sm font-medium opacity-80">{formatDate(bill.createdAt)}</p>
        <h2 className="mt-1 text-2xl font-bold">{bill.title}</h2>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-sm opacity-75">Total</p>
            <p className="text-2xl font-bold">{formatRupiah(total)}</p>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
              {bill.status}
            </span>
            <p className="mt-1 text-sm opacity-75">
              {perUser.length} customer{perUser.length !== 1 ? "s" : ""}
              {" · "}
              {bill.items.filter((i) => i.type === "ITEM").length} item
              {bill.items.filter((i) => i.type === "ITEM").length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white">
        {(["user", "item"] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition",
              view === v
                ? "bg-emerald-500 text-white"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            {v === "user" ? "By Customer" : "By Item"}
          </button>
        ))}
      </div>

      {view === "user" ? (
        <BillDetailByUser users={perUser} />
      ) : (
        <BillDetailByItem items={perItem} />
      )}
    </div>
  );
}
