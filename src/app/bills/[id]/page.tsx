import { notFound } from "next/navigation";
import { findBillByIdWithDetails } from "@/features/bills/repositories/bill-repository";
import { BillDetail } from "@/features/bills/components/bill-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PublicBillDetailPage({ params }: Props) {
  const { id } = await params;

  const bill = await findBillByIdWithDetails(id);

  if (!bill) notFound();

  const shareUrl = `${process.env.AUTH_URL}/bills/${id}`;

  return <BillDetail bill={bill} shareUrl={shareUrl} />;
}
