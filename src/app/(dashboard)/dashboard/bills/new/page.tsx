import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";
import { CreateBillForm } from "@/features/bills/components/create-bill-form";

export default function NewBillPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={ROUTES.dashboard}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          aria-label="Back to dashboard"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-bold text-gray-900">Create New Bill</h2>
      </div>
      <CreateBillForm />
    </div>
  );
}
