"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/queries";
import { signResetToken } from "@/lib/session";

type Result = { error?: string };

/** Returns a one-time reset path (valid 24 hours) for the admin to send to a teammate. */
export async function createResetLink(userId: string): Promise<Result & { path?: string }> {
  await requireAdmin();
  if (!isUuid(userId)) return { error: "Unknown member." };
  const [member] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId));
  if (!member) return { error: "This member no longer exists." };
  const token = await signResetToken(userId, member.passwordHash);
  return { path: `/reset-password?token=${encodeURIComponent(token)}` };
}

async function adminCount() {
  const [{ total }] = await db.select({ total: count() }).from(users).where(eq(users.role, "admin"));
  return total;
}

export async function setMemberRole(userId: string, role: UserRole): Promise<Result> {
  const admin = await requireAdmin();
  if (!isUuid(userId) || (role !== "admin" && role !== "member")) return { error: "Invalid request." };
  if (role === "member" && userId === admin.id && (await adminCount()) <= 1) {
    return { error: "You're the only admin. Make someone else an admin first." };
  }
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/", "layout");
  return {};
}

/** Removes an account. Their tasks become unassigned and their notes stay, shown as "Former member". */
export async function removeMember(userId: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!isUuid(userId)) return { error: "Invalid request." };
  if (userId === admin.id) return { error: "You can't remove yourself." };
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/", "layout");
  return {};
}
