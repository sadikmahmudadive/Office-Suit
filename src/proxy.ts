import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/register"];
// Reachable signed in or out: a reset link may be opened on a shared computer.
const ALWAYS_ALLOWED = ["/logout", "/reset-password"];

// Optimistic check only: pages and server actions verify the user again.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (ALWAYS_ALLOWED.includes(pathname)) return NextResponse.next();
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (session && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|ico|webmanifest)$).*)"],
};
