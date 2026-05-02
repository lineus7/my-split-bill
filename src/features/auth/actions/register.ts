"use server";

import bcrypt from "bcryptjs";
import { registerSchema } from "../schemas/register-schema";
import {
  findExistingUser,
  createUser,
} from "../repositories/user-repository";

const BCRYPT_SALT_ROUNDS = 10;
const PG_UNIQUE_VIOLATION = "23505";

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { username, email, password } = parsed.data;

  try {
    const existing = await findExistingUser(username, email);

    if (existing) {
      if (existing.email === email) {
        return { error: "An account with this email already exists" };
      }
      if (existing.username === username) {
        return { error: "This username is already taken" };
      }
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    await createUser({
      username,
      email,
      password: passwordHash,
      isActive: false,
    });

    return { success: true };
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      return {
        error: "An account with this username or email already exists",
      };
    }
    return { error: "Something went wrong. Please try again." };
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === PG_UNIQUE_VIOLATION
  );
}
