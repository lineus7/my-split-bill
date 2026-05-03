import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";
import { SplitBillForm } from "@/features/bills/components/split-bill-form";

export default function SplitBillPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={ROUTES.billsNew}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          aria-label="Back to create bill"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Split Bill</h2>
          <p className="text-xs text-gray-400">Step 2 of 2</p>
        </div>
      </div>
      <SplitBillForm />
    </div>
  );
}
