import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/shared/constants/routes";
import { findBillByIdWithDetails } from "@/features/bills/repositories/bill-repository";
import { BillDetail } from "@/features/bills/components/bill-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BillDetailPage({ params }: Props) {
  const [session, { id }] = await Promise.all([auth(), params]);

  if (!session?.user?.id) notFound();

  const bill = await findBillByIdWithDetails(id, session.user.id);

  if (!bill) notFound();

  return (
    <div>
      <Link
        href={ROUTES.dashboard}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-800"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>
      <BillDetail bill={bill} />
    </div>
  );
}
