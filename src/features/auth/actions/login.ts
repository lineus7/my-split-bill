"use server";

import { signIn } from "@/lib/auth";
import { loginSchema } from "../schemas/login-schema";

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

  try {
    await signIn("credentials", {
      login: parsed.data.login,
      password: parsed.data.password,
      redirectTo: "/dashboard",
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
    return { error: "Invalid email/username or password" };
  }
}
