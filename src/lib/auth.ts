import "server-only";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { passwordFingerprint, SESSION_COOKIE, signSession, verifySession } from "./session";

export type CurrentUser = { id: string; name: string; email: string; role: UserRole };

export async function startSession(userId: string, passwordHash: string) {
  const { token, expires } = await signSession(userId, passwordHash);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in user, or null. Cached for the duration of one request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.userId));
  if (!user) return null;
  // Sessions issued before the latest password change are no longer valid.
  if (session.pv && session.pv !== (await passwordFingerprint(user.passwordHash))) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
});

/** Use in pages and server actions: sends signed-out visitors to the login page. */
export async function requireUser() {
  const user = await getCurrentUser();
  // A valid cookie for a deleted account: clear it rather than loop between pages.
  if (!user) redirect("/logout");
  return user;
}

/** For admin-only server actions. The UI hides these controls from members. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Only admins can do that.");
  return user;
}
