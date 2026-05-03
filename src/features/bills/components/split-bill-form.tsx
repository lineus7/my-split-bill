"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/constants/routes";
import { formatRupiah, calcGrandTotal } from "../lib/calculations";
import { useBillDraftStore } from "../stores/bill-draft-store";
import { createBillAction, type CreateBillState } from "../actions/create-bill";
import { CustomerTabBar } from "./customer-tab-bar";
import { ItemAssignmentChecklist } from "./item-assignment-checklist";

export function SplitBillForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const {
    title, items, taxAmount, serviceAmount, additionalCharges, customers,
    addCustomer, removeCustomer, toggleItemForCustomer, reset,
  } = useBillDraftStore();

  const [state, formAction, isPending] = useActionState<CreateBillState, FormData>(
    createBillAction,
    {}
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace(ROUTES.billsNew);
    }
  }, [mounted, items.length, router]);

  useEffect(() => {
    if (state.success) {
      reset();
      router.push(ROUTES.dashboard);
    }
  }, [state.success, reset, router]);

  useEffect(() => {
    if (customers.length > 0 && !customers.find((c) => c.id === activeCustomerId)) {
      setActiveCustomerId(customers[0].id);
    }
    if (customers.length === 0) {
      setActiveCustomerId(null);
    }
  }, [customers, activeCustomerId]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const activeCustomer = customers.find((c) => c.id === activeCustomerId) ?? null;
  const unassignedItems = items.filter(
    (item) => !customers.some((c) => c.itemIds.includes(item.id))
  );
  const canSubmit = customers.length > 0 && unassignedItems.length === 0;
  const total = calcGrandTotal(items, taxAmount, serviceAmount, additionalCharges);

  function handleSubmit() {
    const payload = JSON.stringify({
      title, items, taxAmount, serviceAmount, additionalCharges, customers,
    });
    const formData = new FormData();
    formData.append("payload", payload);
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <div className="space-y-6 pb-6">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="rounded-xl bg-emerald-50 p-4">
        <p className="text-sm text-gray-500">Bill</p>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-lg font-bold text-emerald-700">
          {formatRupiah(total)}
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-gray-800">Customers</h2>
        <CustomerTabBar
          customers={customers}
          activeId={activeCustomerId}
          onSelect={setActiveCustomerId}
          onAdd={addCustomer}
          onRemove={removeCustomer}
        />
      </section>

      {activeCustomer && (
        <section>
          <h2 className="mb-3 font-semibold text-gray-800">
            Items for{" "}
            <span className="text-emerald-600">{activeCustomer.name}</span>
          </h2>
          <ItemAssignmentChecklist
            items={items}
            customers={customers}
            activeCustomer={activeCustomer}
            onToggle={(itemId) =>
              toggleItemForCustomer(activeCustomer.id, itemId)
            }
          />
        </section>
      )}

      {unassignedItems.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="mb-1 text-sm font-medium text-amber-800">
            Items without a customer:
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-amber-700">
            {unassignedItems.map((item) => (
              <li key={item.id}>{item.name || "Unnamed item"}</li>
            ))}
          </ul>
        </div>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        isLoading={isPending}
        disabled={!canSubmit}
      >
        Submit Bill
      </Button>
    </div>
  );
}
