import { z } from "zod/v4";

const scanAddOnSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().min(1),
});

const scanItemSchema = z.object({
  name: z.string(),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  addOns: z.array(scanAddOnSchema),
});

const scanAdditionalChargeSchema = z.object({
  name: z.string(),
  amount: z.number().min(0),
  kind: z.enum(["CHARGE", "DISCOUNT"]),
});

export const scanBillSchema = z.object({
  title: z.string(),
  items: z.array(scanItemSchema),
  taxAmount: z.number().min(0),
  serviceAmount: z.number().min(0),
  additionalCharges: z.array(scanAdditionalChargeSchema),
});

export type ScanBillResult = z.infer<typeof scanBillSchema>;
