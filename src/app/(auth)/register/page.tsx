import { count } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  await connection(); // Render per request; the user count changes.
  const [{ total }] = await db.select({ total: count() }).from(users);
  const isFirstUser = total === 0;

  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">Create your account</h1>
      <p className="mb-4 text-sm text-muted">
        {isFirstUser
          ? "You're the first one here. This account sets up the workspace."
          : "Ask a teammate for the team invite code."}
      </p>
      <RegisterForm needsInviteCode={!isFirstUser} />
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
