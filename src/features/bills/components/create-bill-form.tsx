"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { ROUTES } from "@/shared/constants/routes";
import { billDraftSchema } from "../schemas/bill-draft-schema";
import { useBillDraftStore } from "../stores/bill-draft-store";
import { ItemRow } from "./item-row";
import { AdditionalChargeRow } from "./additional-charge-row";
import { BillSummary } from "./bill-summary";
import { ScanBillModal } from "./scan-bill-modal";

export function CreateBillForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  const {
    title, items, taxAmount, serviceAmount, additionalCharges,
    setTitle, addItem, updateItem, removeItem,
    addAddOn, updateAddOn, removeAddOn,
    setTax, setService,
    addAdditional, updateAdditional, removeAdditional,
    reset,
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

  const isDirty =
    title.trim().length > 0 ||
    items.length > 0 ||
    taxAmount > 0 ||
    serviceAmount > 0 ||
    additionalCharges.length > 0;

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

  function handleReset() {
    reset();
    setError(null);
    setShowResetConfirm(false);
  }

  return (
    <>
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowScanModal(true)}
                className="flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                Scan Bill
              </button>
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

        <div className="flex flex-col gap-3">
          <Button type="button" onClick={handleNext}>
            Next: Split Bill →
          </Button>
          {isDirty && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowResetConfirm(true)}
            >
              Reset Bill
            </Button>
          )}
        </div>
      </div>

      <ScanBillModal
        open={showScanModal}
        onClose={() => setShowScanModal(false)}
      />

      <Modal
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </div>

          <h3 className="mt-4 text-lg font-bold text-gray-900">Reset this bill?</h3>
          <p className="mt-1.5 text-sm text-gray-500">
            All data will be permanently cleared and cannot be undone.
          </p>
        </div>

        {(title.trim() || items.length > 0 || taxAmount > 0 || serviceAmount > 0 || additionalCharges.length > 0) && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-400">
              Will be cleared
            </p>
            <ul className="space-y-1 text-sm text-red-700">
              {title.trim() && (
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-red-400" />
                  Bill title: &ldquo;{title.trim()}&rdquo;
                </li>
              )}
              {items.length > 0 && (
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-red-400" />
                  {items.length} item{items.length > 1 ? "s" : ""}
                  {items.reduce((s, i) => s + i.addOns.length, 0) > 0 &&
                    ` + ${items.reduce((s, i) => s + i.addOns.length, 0)} add-on${items.reduce((s, i) => s + i.addOns.length, 0) > 1 ? "s" : ""}`}
                </li>
              )}
              {(taxAmount > 0 || serviceAmount > 0) && (
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-red-400" />
                  Tax &amp; service charges
                </li>
              )}
              {additionalCharges.length > 0 && (
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-red-400" />
                  {additionalCharges.length} additional charge{additionalCharges.length > 1 ? "s" : ""}
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-[0.98]"
          >
            Yes, reset all
          </button>
          <button
            type="button"
            onClick={() => setShowResetConfirm(false)}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}
