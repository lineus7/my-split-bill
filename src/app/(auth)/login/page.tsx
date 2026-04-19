import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <AuthCard subtitle="Sign in to manage your shared expenses">
      <LoginForm />
    </AuthCard>
  );
}
