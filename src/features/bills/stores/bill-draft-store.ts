"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AddOnDraft,
  AdditionalChargeDraft,
  CustomerDraft,
  ItemDraft,
} from "../types";
import type { ScanBillResult } from "../schemas/scan-bill-schema";

function newId(): string {
  return crypto.randomUUID();
}

type BillDraftState = {
  title: string;
  items: ItemDraft[];
  taxAmount: number;
  serviceAmount: number;
  additionalCharges: AdditionalChargeDraft[];
  customers: CustomerDraft[];

  setTitle: (v: string) => void;
  addItem: () => void;
  updateItem: (id: string, patch: Partial<Omit<ItemDraft, "id" | "addOns">>) => void;
  removeItem: (id: string) => void;
  addAddOn: (itemId: string) => void;
  updateAddOn: (itemId: string, addOnId: string, patch: Partial<Omit<AddOnDraft, "id">>) => void;
  removeAddOn: (itemId: string, addOnId: string) => void;
  setTax: (v: number) => void;
  setService: (v: number) => void;
  addAdditional: () => void;
  updateAdditional: (id: string, patch: Partial<Omit<AdditionalChargeDraft, "id">>) => void;
  removeAdditional: (id: string) => void;
  addCustomer: (name: string) => void;
  removeCustomer: (id: string) => void;
  toggleItemForCustomer: (customerId: string, itemId: string) => void;
  loadDraft: (data: ScanBillResult) => void;
  reset: () => void;
};

const initialState = {
  title: "",
  items: [],
  taxAmount: 0,
  serviceAmount: 0,
  additionalCharges: [],
  customers: [],
};

export const useBillDraftStore = create<BillDraftState>()(
  persist(
    (set) => ({
      ...initialState,

      setTitle: (v) => set({ title: v }),

      addItem: () =>
        set((s) => ({
          items: [
            ...s.items,
            { id: newId(), name: "", price: 0, quantity: 1, addOns: [] },
          ],
        })),

      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === id ? { ...item, ...patch } : item
          ),
        })),

      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((item) => item.id !== id),
          customers: s.customers.map((c) => ({
            ...c,
            itemIds: c.itemIds.filter((iid) => iid !== id),
          })),
        })),

      addAddOn: (itemId) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  addOns: [
                    ...item.addOns,
                    { id: newId(), name: "", price: 0, quantity: 1 },
                  ],
                }
              : item
          ),
        })),

      updateAddOn: (itemId, addOnId, patch) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  addOns: item.addOns.map((a) =>
                    a.id === addOnId ? { ...a, ...patch } : a
                  ),
                }
              : item
          ),
        })),

      removeAddOn: (itemId, addOnId) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  addOns: item.addOns.filter((a) => a.id !== addOnId),
                }
              : item
          ),
        })),

      setTax: (v) => set({ taxAmount: v }),
      setService: (v) => set({ serviceAmount: v }),

      addAdditional: () =>
        set((s) => ({
          additionalCharges: [
            ...s.additionalCharges,
            { id: newId(), name: "", amount: 0, kind: "CHARGE" },
          ],
        })),

      updateAdditional: (id, patch) =>
        set((s) => ({
          additionalCharges: s.additionalCharges.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),

      removeAdditional: (id) =>
        set((s) => ({
          additionalCharges: s.additionalCharges.filter((c) => c.id !== id),
        })),

      addCustomer: (name) =>
        set((s) => ({
          customers: [...s.customers, { id: newId(), name, itemIds: [] }],
        })),

      removeCustomer: (id) =>
        set((s) => ({
          customers: s.customers.filter((c) => c.id !== id),
        })),

      toggleItemForCustomer: (customerId, itemId) =>
        set((s) => ({
          customers: s.customers.map((c) => {
            if (c.id !== customerId) return c;
            const has = c.itemIds.includes(itemId);
            return {
              ...c,
              itemIds: has
                ? c.itemIds.filter((id) => id !== itemId)
                : [...c.itemIds, itemId],
            };
          }),
        })),

      loadDraft: (data) =>
        set({
          title: data.title,
          items: data.items.map((it) => ({
            id: newId(),
            name: it.name,
            price: it.price,
            quantity: it.quantity,
            addOns: it.addOns.map((a) => ({
              id: newId(),
              name: a.name,
              price: a.price,
              quantity: a.quantity,
            })),
          })),
          taxAmount: data.taxAmount,
          serviceAmount: data.serviceAmount,
          additionalCharges: data.additionalCharges.map((c) => ({
            id: newId(),
            name: c.name,
            amount: c.amount,
            kind: c.kind,
          })),
          customers: [],
        }),

      reset: () => set(initialState),
    }),
    { name: "bill-draft-v1" }
  )
);
