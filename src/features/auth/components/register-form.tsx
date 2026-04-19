"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/register-schema";
import { registerAction, type RegisterState } from "../actions/register";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<
    RegisterState,
    FormData
  >(registerAction, {});

  const {
    register,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  return (
    <>
      <form action={formAction} className="space-y-5">
        {state.error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <Input
          id="username"
          label="Username"
          type="text"
          placeholder="Choose a username"
          autoComplete="username"
          error={errors.username?.message}
          {...register("username")}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" isLoading={isPending}>
          Create Account
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      </form>

      <Modal open={state.success === true} title="Registration Complete">
        <p className="text-sm text-gray-600">
          Your account has been created successfully.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        >
          Go to Login
        </Link>
      </Modal>
    </>
  );
}
