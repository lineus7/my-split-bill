"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../schemas/change-password-schema";
import {
  changePasswordAction,
  type ChangePasswordState,
} from "../actions/change-password";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<
    ChangePasswordState,
    FormData
  >(changePasswordAction, {});

  const {
    register,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
  });

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Input
        id="currentPassword"
        label="Current Password"
        type="password"
        placeholder="Enter your current password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />

      <Input
        id="newPassword"
        label="New Password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />

      <Input
        id="confirmNewPassword"
        label="Confirm New Password"
        type="password"
        placeholder="Re-enter your new password"
        autoComplete="new-password"
        error={errors.confirmNewPassword?.message}
        {...register("confirmNewPassword")}
      />

      <Button type="submit" isLoading={isPending}>
        Update Password
      </Button>
    </form>
  );
}
