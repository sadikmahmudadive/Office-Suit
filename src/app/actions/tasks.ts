"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { taskComments, tasks, type TaskStatus } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { isISODate, todayISO } from "@/lib/dates";
import { isPriority, isStatus } from "@/lib/labels";
import { getTask, isUuid } from "@/lib/queries";

export type TaskFormState = { error?: string } | undefined;

function parseTaskForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").replace(/\r\n?/g, "\n").trim();
  const status = formData.get("status");
  const priority = formData.get("priority");
  const dueDate = String(formData.get("dueDate") ?? "");
  const assigneeId = String(formData.get("assigneeId") ?? "");

  if (!title) return { error: "Give the task a title." } as const;
  if (title.length > 200) return { error: "Keep the title under 200 characters." } as const;
  if (!isStatus(status) || !isPriority(priority)) return { error: "Pick a status and priority." } as const;
  if (dueDate && !isISODate(dueDate)) return { error: "The due date isn't valid." } as const;
  if (assigneeId && !isUuid(assigneeId)) return { error: "Pick a valid assignee." } as const;

  return {
    values: {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      assigneeId: assigneeId || null,
    },
  } as const;
}

/** Keeps completedOn in step with the status: set on entering Done, cleared on leaving it. */
function completedOnFor(status: TaskStatus, previous?: { status: TaskStatus; completedOn: string | null }) {
  if (status !== "done") return null;
  if (previous?.status === "done" && previous.completedOn) return previous.completedOn;
  return todayISO();
}

export async function createTask(_prev: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const user = await requireUser();
  const parsed = parseTaskForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await db.insert(tasks).values({
    ...parsed.values,
    completedOn: completedOnFor(parsed.values.status),
    createdById: user.id,
  });

  revalidatePath("/", "layout");
  redirect("/tasks");
}

export async function updateTask(
  id: string,
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  await requireUser();
  const existing = await getTask(id);
  if (!existing) return { error: "This task no longer exists." };
  const parsed = parseTaskForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await db
    .update(tasks)
    .set({
      ...parsed.values,
      completedOn: completedOnFor(parsed.values.status, existing),
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));

  revalidatePath("/", "layout");
  redirect(`/tasks/${id}`);
}

export async function setTaskStatus(id: string, status: TaskStatus) {
  await requireUser();
  if (!isStatus(status)) throw new Error("Invalid status");
  const existing = await getTask(id);
  if (!existing || existing.status === status) return;

  await db
    .update(tasks)
    .set({ status, completedOn: completedOnFor(status, existing), updatedAt: new Date() })
    .where(eq(tasks.id, id));

  revalidatePath("/", "layout");
}

export async function deleteTask(id: string) {
  await requireUser();
  if (!isUuid(id)) return;
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath("/", "layout");
  redirect("/tasks");
}

export type CommentFormState = { error?: string } | undefined;

export async function addComment(
  taskId: string,
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").replace(/\r\n?/g, "\n").trim();
  if (!body) return { error: "Write a comment first." };
  if (body.length > 5000) return { error: "Keep comments under 5,000 characters." };
  if (!(await getTask(taskId))) return { error: "This task no longer exists." };

  await db.insert(taskComments).values({ taskId, authorId: user.id, body });
  revalidatePath("/", "layout");
  return {};
}

/** Authors can delete their own comments; admins can delete any. */
export async function deleteComment(id: string) {
  const user = await requireUser();
  if (!isUuid(id)) return;
  await db
    .delete(taskComments)
    .where(user.role === "admin" ? eq(taskComments.id, id) : and(eq(taskComments.id, id), eq(taskComments.authorId, user.id)));
  revalidatePath("/", "layout");
}
