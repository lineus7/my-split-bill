import { z } from "zod/v4";

export const loginSchema = z.object({
  login: z
    .string()
    .min(1, "Email or username is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
