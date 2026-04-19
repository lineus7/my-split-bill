import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <AuthCard subtitle="Sign up to start splitting bills with friends">
      <RegisterForm />
    </AuthCard>
  );
}
