"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { ROUTES } from "@/shared/constants/routes";
import { GENERAL_KEYS } from "@/shared/constants/general-keys";
import { getGeneralValue } from "@/shared/lib/general";
import { loginSchema } from "../schemas/login-schema";
import { findUserByLogin } from "../repositories/user-repository";

const ADMIN_EMAIL_FALLBACK = "admin@example.com";
const INVALID_CREDENTIALS = "Invalid email/username or password";

function inactiveAccountMessage(adminEmail: string): string {
  return `Your account is not yet activated. Please contact ${adminEmail} to activate your account.`;
}

export type LoginState = {
  error?: string;
  success?: boolean;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const raw = {
    login: formData.get("login"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Pre-check so we can distinguish "wrong credentials" from "inactive account".
  // Only reveal inactivity AFTER the password has been verified — this prevents
  // account enumeration via the activation message.
  const user = await findUserByLogin(parsed.data.login);

  if (!user) {
    return { error: INVALID_CREDENTIALS };
  }

  const passwordValid = await bcrypt.compare(parsed.data.password, user.password);
  if (!passwordValid) {
    return { error: INVALID_CREDENTIALS };
  }

  if (!user.isActive) {
    const adminEmail =
      (await getGeneralValue(GENERAL_KEYS.authAdminEmail)) ?? ADMIN_EMAIL_FALLBACK;
    return { error: inactiveAccountMessage(adminEmail) };
  }

  try {
    await signIn("credentials", {
      login: parsed.data.login,
      password: parsed.data.password,
      redirectTo: ROUTES.dashboard,
    });

    return { success: true };
  } catch (error: unknown) {
    // NextAuth throws NEXT_REDIRECT on success, which is expected
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return { error: INVALID_CREDENTIALS };
  }
}
