import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/shared/constants/routes";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const { pathname } = req.nextUrl;
  const isAuthPage =
    pathname.startsWith(ROUTES.login) || pathname.startsWith(ROUTES.register);

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, req.nextUrl));
  }

  if (!isAuthPage && !isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.login, req.nextUrl));
  }

  return NextResponse.next();
});

// Matcher must be static literals — Next.js evaluates this at build time.
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
