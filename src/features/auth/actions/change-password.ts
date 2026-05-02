"use server";

import bcrypt from "bcryptjs";
import { auth, signOut } from "@/lib/auth";
import { ROUTES } from "@/shared/constants/routes";
import { changePasswordSchema } from "../schemas/change-password-schema";
import {
  findUserById,
  updateUserPassword,
} from "../repositories/user-repository";

const BCRYPT_SALT_ROUNDS = 10;

export type ChangePasswordState = {
  error?: string;
  success?: boolean;
};

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await findUserById(session.user.id);
  if (!user) {
    return { error: "Account not found" };
  }

  const currentPasswordValid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.password
  );
  if (!currentPasswordValid) {
    return { error: "Current password is incorrect" };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_SALT_ROUNDS);
  await updateUserPassword(user.id, newHash);

  try {
    await signOut({ redirectTo: ROUTES.login });
    return { success: true };
  } catch (error: unknown) {
    // NextAuth throws NEXT_REDIRECT on success — re-throw so Next.js handles the redirect
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return { success: true };
  }
}
