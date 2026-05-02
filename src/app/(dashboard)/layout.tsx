import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/shared/constants/routes";
import { UserMenu } from "./_components/user-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.login);
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-gray-50">
      <header className="rounded-b-2xl bg-linear-to-r from-emerald-600 to-teal-700 shadow-lg shadow-emerald-900/10">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-bold text-white">My Split Bill</h1>
          <UserMenu username={session.user.name ?? session.user.email ?? "Account"} />
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
