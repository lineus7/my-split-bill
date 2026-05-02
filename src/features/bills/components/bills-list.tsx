"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/utils";
import { formatRupiah } from "../lib/calculations";
import type { BillListItem } from "../types";

type Props = {
  bills: BillListItem[];
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function BillsList({ bills }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bills;
    return bills.filter((b) => b.title.toLowerCase().includes(q));
  }, [bills, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bills by name..."
          className={cn(
            "w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-3 pl-9 text-sm outline-none transition",
            "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          )}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          {query.trim()
            ? `No bills match "${query.trim()}"`
            : "No bills yet. Create your first bill to start splitting."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((bill) => (
            <Link
              key={bill.id}
              href={ROUTES.billDetail(bill.id)}
              className={cn(
                "block rounded-xl border border-gray-200 bg-white p-4 transition",
                "hover:border-emerald-300 hover:shadow-sm"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {bill.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatDate(bill.createdAt)}</span>
                    <span>·</span>
                    <span>
                      {bill.itemCount} item{bill.itemCount === 1 ? "" : "s"}
                    </span>
                    <span>·</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                      {bill.status}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-emerald-700">
                    {formatRupiah(bill.total)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
