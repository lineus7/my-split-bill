import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
      <p className="mt-2 text-gray-600">
        Welcome back, {session?.user?.name}! Start splitting bills with your
        friends.
      </p>

      {/* Placeholder card */}
      <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">
          Your bills and groups will appear here.
        </p>
      </div>
    </div>
  );
}
