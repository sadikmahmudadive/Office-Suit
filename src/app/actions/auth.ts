"use server";

import bcrypt from "bcryptjs";
import { and, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { endSession, requireUser, startSession } from "@/lib/auth";
import { passwordFingerprint, verifyResetToken } from "@/lib/session";

export type AuthState = { error?: string; success?: string } | undefined;

// Compared against when the email is unknown, so both paths take similar time.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);
const MIN_PASSWORD = 8;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const [user] = await db.select().from(users).where(eq(users.email, email));
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return { error: "That email and password don't match." };

  await startSession(user.id, user.passwordHash);
  redirect("/");
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();

  if (!name || name.length > 80) return { error: "Enter your name." };
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  if (password.length < MIN_PASSWORD) return { error: "Password must be at least 8 characters." };

  // The first account can always be created and becomes the admin; after that, an invite code is required.
  const [{ total }] = await db.select({ total: count() }).from(users);
  if (total > 0) {
    const expected = process.env.TEAM_INVITE_CODE;
    if (!expected) return { error: "Sign-ups are closed. Ask your admin for access." };
    if (inviteCode !== expected) return { error: "That invite code isn't right." };
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: total === 0 ? "admin" : "member" })
    .returning({ id: users.id });

  await startSession(user.id, passwordHash);
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/login");
}

export async function updateProfile(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name || name.length > 80) return { error: "Enter your name." };
  if (!isEmail(email)) return { error: "Enter a valid email address." };

  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), ne(users.id, user.id)));
  if (taken) return { error: "Another account already uses this email." };

  await db.update(users).set({ name, email }).where(eq(users.id, user.id));
  revalidatePath("/", "layout");
  return { success: "Profile saved." };
}

export async function changePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await requireUser();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (next.length < MIN_PASSWORD) return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "The new passwords don't match." };

  const [row] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id));
  if (!row || !(await bcrypt.compare(current, row.passwordHash))) {
    return { error: "Your current password isn't right." };
  }

  const passwordHash = await bcrypt.hash(next, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  // Other devices are signed out by the new password; keep this one signed in.
  await startSession(user.id, passwordHash);
  return { success: "Password changed. You've been signed out on other devices." };
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password.length < MIN_PASSWORD) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "The passwords don't match." };

  const reset = await verifyResetToken(token);
  const [user] = reset
    ? await db.select().from(users).where(eq(users.id, reset.userId))
    : [];
  // A changed password changes the fingerprint, so each link works only once.
  if (!reset || !user || reset.pv !== (await passwordFingerprint(user.passwordHash))) {
    return { error: "This reset link has expired or was already used. Ask your admin for a new one." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  await startSession(user.id, passwordHash);
  redirect("/");
}
