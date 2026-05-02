import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
      <p className="mt-2 text-sm text-gray-500">
        Welcome back, {session?.user?.name}!
      </p>

      <div className="mt-8 flex flex-col items-center rounded-2xl bg-white p-10 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <svg
            className="h-8 w-8 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 14.25l3-3m0 0l3 3m-3-3v8.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-900">No bills yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Create your first bill to start splitting with friends.
        </p>
      </div>
    </div>
  );
}
