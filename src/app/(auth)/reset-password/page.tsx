import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { users } from "@/db/schema";
import { passwordFingerprint, verifyResetToken } from "@/lib/session";
import { ResetPasswordForm } from "./reset-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const reset = typeof token === "string" ? await verifyResetToken(token) : null;
  const [user] = reset
    ? await db.select({ name: users.name, passwordHash: users.passwordHash }).from(users).where(eq(users.id, reset.userId))
    : [];
  const valid = reset && user && reset.pv === (await passwordFingerprint(user.passwordHash));

  if (!valid) {
    return (
      <>
        <h1 className="mb-2 text-lg font-semibold">Link expired</h1>
        <p className="mb-4 text-sm text-muted">
          This reset link has expired or was already used. Ask an admin on the Team page for a new one.
        </p>
        <Link href="/login" className="btn w-full">
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">Set a new password</h1>
      <p className="mb-4 text-sm text-muted">For {user.name}. You&apos;ll be signed in afterwards.</p>
      <ResetPasswordForm token={token as string} />
    </>
  );
}
