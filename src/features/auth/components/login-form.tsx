"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/constants/routes";
import { loginSchema, type LoginFormData } from "../schemas/login-schema";
import { loginAction, type LoginState } from "../actions/login";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  );

  const {
    register,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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
        id="login"
        label="Email or Username"
        type="text"
        placeholder="Enter your email or username"
        autoComplete="username"
        error={errors.login?.message}
        {...register("login")}
      />

      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button type="submit" isLoading={isPending}>
        Sign In
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.register}
          className="font-semibold text-emerald-600 hover:text-emerald-500"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
