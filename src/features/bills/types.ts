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

export type BillListItem = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  total: number;
  itemCount: number;
};

export type BillDetailItem = {
  id: string;
  name: string;
  type: "ITEM" | "TAX" | "SERVICE_CHARGE" | "ADDITIONAL";
  price: number;
  quantity: number;
  addOns: Array<{ id: string; name: string; price: number; quantity: number }>;
  users: Array<{ id: string; displayName: string }>;
};

export type BillDetail = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  items: BillDetailItem[];
};
