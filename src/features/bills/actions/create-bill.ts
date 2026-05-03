"use server";

import { auth } from "@/lib/auth";
import { createBillSchema } from "../schemas/create-bill-schema";
import { createBillWithSplit } from "../repositories/bill-repository";

export type CreateBillState = {
  error?: string;
  success?: boolean;
};

export async function createBillAction(
  _prevState: CreateBillState,
  formData: FormData
): Promise<CreateBillState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(formData.get("payload") as string);
  } catch {
    return { error: "Invalid request payload" };
  }

  const result = createBillSchema.safeParse(parsed);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  await createBillWithSplit(session.user.id, result.data);

  return { success: true };
}
