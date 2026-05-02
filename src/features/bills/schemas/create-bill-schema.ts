import { z } from "zod/v4";
import { billDraftSchema } from "./bill-draft-schema";

const customerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Customer name is required"),
  itemIds: z.array(z.string()),
});

export const createBillSchema = billDraftSchema
  .extend({
    customers: z
      .array(customerSchema)
      .min(1, "Add at least one customer"),
  })
  .refine(
    (data) => {
      const customerNames = data.customers.map((c) =>
        c.name.trim().toLowerCase()
      );
      return new Set(customerNames).size === customerNames.length;
    },
    { message: "Customer names must be unique" }
  )
  .refine(
    (data) => {
      return data.items.every((item) =>
        data.customers.some((c) => c.itemIds.includes(item.id))
      );
    },
    { message: "Every item must be assigned to at least one customer" }
  )
  .refine(
    (data) => {
      const itemIds = new Set(data.items.map((i) => i.id));
      return data.customers.every((c) =>
        c.itemIds.every((id) => itemIds.has(id))
      );
    },
    { message: "Invalid item assignment detected" }
  );

export type CreateBillData = z.infer<typeof createBillSchema>;
