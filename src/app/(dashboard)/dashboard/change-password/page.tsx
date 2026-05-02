import Link from "next/link";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { ROUTES } from "@/shared/constants/routes";

export default function ChangePasswordPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={ROUTES.dashboard}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
      <p className="mt-1 text-sm text-gray-500">
        After updating, you will be signed out and need to log in again with your new password.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:max-w-md">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
