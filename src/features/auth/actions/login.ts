"use server";

import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { signIn } from "@/lib/auth";
import { ROUTES } from "@/shared/constants/routes";
import { loginSchema } from "../schemas/login-schema";

export type LoginState = {
  error?: string;
  success?: boolean;
};

const ADMIN_EMAIL = process.env.AUTH_ADMIN_EMAIL ?? "admin@example.com";
const INVALID_CREDENTIALS = "Invalid email/username or password";
const INACTIVE_ACCOUNT = `Your account is not yet activated. Please contact ${ADMIN_EMAIL} to activate your account.`;

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
  const user = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, parsed.data.login),
        eq(users.username, parsed.data.login)
      )
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (!user) {
    return { error: INVALID_CREDENTIALS };
  }

  const passwordValid = await bcrypt.compare(parsed.data.password, user.password);
  if (!passwordValid) {
    return { error: INVALID_CREDENTIALS };
  }

  if (!user.isActive) {
    return { error: INACTIVE_ACCOUNT };
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
    if (
      error instanceof Error &&
      error.message === "NEXT_REDIRECT"
    ) {
      throw error;
    }
    return { error: INVALID_CREDENTIALS };
  }
}
