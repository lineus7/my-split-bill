import { CreateBillForm } from "@/features/bills/components/create-bill-form";

export default function NewBillPage() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">Create New Bill</h2>
      <CreateBillForm />
    </div>
  );
}
