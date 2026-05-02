"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/shared/constants/routes";
import { createBillSchema } from "../schemas/create-bill-schema";
import { createBillWithSplit } from "../repositories/bill-repository";

export type CreateBillState = {
  error?: string;
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

  redirect(ROUTES.dashboard);
}
