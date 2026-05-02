import Link from "next/link";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/shared/constants/routes";
import { findBillsByUserId } from "@/features/bills/repositories/bill-repository";
import { BillsList } from "@/features/bills/components/bills-list";

export default async function DashboardPage() {
  const session = await auth();
  const bills = session?.user?.id
    ? await findBillsByUserId(session.user.id)
    : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Bills</h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {session?.user?.name}!
          </p>
        </div>
        <Link
          href={ROUTES.billsNew}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Bill
        </Link>
      </div>

      <BillsList bills={bills} />
    </div>
  );
}
