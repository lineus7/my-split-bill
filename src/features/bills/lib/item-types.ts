export const ITEM_TYPES = {
  ITEM: "ITEM",
  TAX: "TAX",
  SERVICE_CHARGE: "SERVICE_CHARGE",
  ADDITIONAL: "ADDITIONAL",
} as const;

export type ItemTypeName = (typeof ITEM_TYPES)[keyof typeof ITEM_TYPES];
