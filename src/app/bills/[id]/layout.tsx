import Link from "next/link";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/shared/constants/routes";
import { UserMenu } from "@/app/(dashboard)/_components/user-menu";

export default async function BillPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-gray-50">
      <header className="rounded-b-2xl bg-linear-to-r from-emerald-600 to-teal-700 shadow-lg shadow-emerald-900/10">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <Link
                href={ROUTES.dashboard}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label="Back to dashboard"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            <div>
              <h1 className="text-base font-bold leading-tight text-white">My Split Bill</h1>
              {!isLoggedIn && (
                <p className="text-[10px] font-medium leading-tight text-emerald-200/80">Shared bill view</p>
              )}
            </div>
          </div>

          {isLoggedIn ? (
            <UserMenu username={session.user!.name ?? session.user!.email ?? "Account"} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.login}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-100 transition hover:bg-white/10 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href={ROUTES.register}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
