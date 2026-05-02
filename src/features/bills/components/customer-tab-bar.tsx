"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import type { CustomerDraft } from "../types";

type Props = {
  customers: CustomerDraft[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
};

export function CustomerTabBar({
  customers,
  activeId,
  onSelect,
  onAdd,
  onRemove,
}: Props) {
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) {
      setInputError("Name cannot be empty");
      return;
    }
    const duplicate = customers.some(
      (c) => c.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setInputError("Name already exists");
      return;
    }
    setInputError(null);
    onAdd(trimmed);
    setInput("");
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setInputError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Customer name..."
            className={cn(
              "w-full rounded-xl border px-3 py-2 text-sm outline-none transition",
              "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100",
              inputError ? "border-red-400" : "border-gray-200"
            )}
          />
          {inputError && (
            <p className="mt-1 text-xs text-red-600">{inputError}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
        >
          Add
        </button>
      </div>

      {customers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customers.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                activeId === c.id
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className="font-medium"
              >
                {c.name}
              </button>
              <button
                type="button"
                onClick={() => onRemove(c.id)}
                className={cn(
                  "rounded-full p-0.5 transition",
                  activeId === c.id
                    ? "hover:bg-emerald-400"
                    : "hover:bg-gray-100"
                )}
                aria-label={`Remove ${c.name}`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
