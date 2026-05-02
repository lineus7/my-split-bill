import { z } from "zod/v4";

const addOnSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Add-on name is required"),
  price: z.number().min(0, "Price must be 0 or more"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

const itemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Item name is required"),
  price: z.number().min(0, "Price must be 0 or more"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  addOns: z.array(addOnSchema),
});

const additionalChargeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Charge name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  kind: z.enum(["CHARGE", "DISCOUNT"]),
});

export const billDraftSchema = z.object({
  title: z.string().min(1, "Bill title is required"),
  items: z.array(itemSchema).min(1, "Add at least one item"),
  taxAmount: z.number().min(0, "Tax must be 0 or more"),
  serviceAmount: z.number().min(0, "Service charge must be 0 or more"),
  additionalCharges: z.array(additionalChargeSchema),
});

export type BillDraftFormData = z.infer<typeof billDraftSchema>;
