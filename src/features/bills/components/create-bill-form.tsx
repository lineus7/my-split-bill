"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/constants/routes";
import { billDraftSchema } from "../schemas/bill-draft-schema";
import { useBillDraftStore } from "../stores/bill-draft-store";
import { ItemRow } from "./item-row";
import { AdditionalChargeRow } from "./additional-charge-row";
import { BillSummary } from "./bill-summary";

export function CreateBillForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    title, items, taxAmount, serviceAmount, additionalCharges,
    setTitle, addItem, updateItem, removeItem,
    addAddOn, updateAddOn, removeAddOn,
    setTax, setService,
    addAdditional, updateAdditional, removeAdditional,
  } = useBillDraftStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  function handleNext() {
    setError(null);
    const result = billDraftSchema.safeParse({
      title, items, taxAmount, serviceAmount, additionalCharges,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    router.push(ROUTES.billsNewSplit);
  }

  return (
    <div className="space-y-6 pb-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <Input
          label="Bill title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Makan Malam Sabtu"
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Items</h2>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-emerald-600 transition hover:text-emerald-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
            No items yet. Tap &quot;Add Item&quot; to start.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                index={idx}
                onUpdate={(patch) => updateItem(item.id, patch)}
                onRemove={() => removeItem(item.id)}
                onAddAddOn={() => addAddOn(item.id)}
                onUpdateAddOn={(addOnId, patch) => updateAddOn(item.id, addOnId, patch)}
                onRemoveAddOn={(addOnId) => removeAddOn(item.id, addOnId)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-gray-800">Tax &amp; Service</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tax (Rp)"
            type="number"
            min={0}
            value={taxAmount}
            onChange={(e) =>
              setTax(Math.max(0, parseFloat(e.target.value) || 0))
            }
            placeholder="0"
          />
          <Input
            label="Service Charge (Rp)"
            type="number"
            min={0}
            value={serviceAmount}
            onChange={(e) =>
              setService(Math.max(0, parseFloat(e.target.value) || 0))
            }
            placeholder="0"
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Additional Charges</h2>
          <button
            type="button"
            onClick={addAdditional}
            className="flex items-center gap-1 text-sm text-emerald-600 transition hover:text-emerald-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Charge / Discount
          </button>
        </div>
        {additionalCharges.length > 0 && (
          <div className="space-y-2">
            {additionalCharges.map((charge) => (
              <AdditionalChargeRow
                key={charge.id}
                charge={charge}
                onUpdate={(patch) => updateAdditional(charge.id, patch)}
                onRemove={() => removeAdditional(charge.id)}
              />
            ))}
          </div>
        )}
      </section>

      <BillSummary
        items={items}
        taxAmount={taxAmount}
        serviceAmount={serviceAmount}
        additionalCharges={additionalCharges}
      />

      <Button type="button" onClick={handleNext}>
        Next: Split Bill →
      </Button>
    </div>
  );
}
