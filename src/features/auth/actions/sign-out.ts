"use server";

import { signOut } from "@/lib/auth";
import { ROUTES } from "@/shared/constants/routes";

export async function signOutAction() {
  await signOut({ redirectTo: ROUTES.login });
}
