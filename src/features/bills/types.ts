export type AddOnDraft = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type ItemDraft = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  addOns: AddOnDraft[];
};

export type AdditionalChargeDraft = {
  id: string;
  name: string;
  amount: number;
  kind: "CHARGE" | "DISCOUNT";
};

export type CustomerDraft = {
  id: string;
  name: string;
  itemIds: string[];
};

export type BillDraftData = {
  title: string;
  items: ItemDraft[];
  taxAmount: number;
  serviceAmount: number;
  additionalCharges: AdditionalChargeDraft[];
  customers: CustomerDraft[];
};
