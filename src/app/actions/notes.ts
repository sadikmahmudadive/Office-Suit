"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { isISODate, todayISO } from "@/lib/dates";
import { isNoteKind } from "@/lib/labels";
import { plainText } from "@/lib/markdown";
import { isUuid } from "@/lib/queries";

export type NoteFormState = { error?: string } | undefined;

function parseTags(raw: string) {
  const tags = raw
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
    .filter((t) => t && t.length <= 30);
  return [...new Set(tags)].slice(0, 10);
}

function parseNoteForm(formData: FormData) {
  let title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").replace(/\r\n?/g, "\n").trim();
  const kind = formData.get("kind") ?? "log";
  const noteDate = String(formData.get("noteDate") ?? "") || todayISO();
  const taskId = String(formData.get("taskId") ?? "");

  if (!title && !content) return { error: "Write something first." } as const;
  // Quick notes without a title get one from their first line.
  if (!title) title = plainText(content.split("\n")[0]).slice(0, 80) || "Untitled note";
  if (title.length > 200) return { error: "Keep the title under 200 characters." } as const;
  if (!isNoteKind(kind)) return { error: "Pick a note type." } as const;
  if (!isISODate(noteDate)) return { error: "The date isn't valid." } as const;
  if (taskId && !isUuid(taskId)) return { error: "Pick a valid task." } as const;

  return {
    values: {
      title,
      content,
      kind,
      noteDate,
      tags: parseTags(String(formData.get("tags") ?? "")),
      taskId: taskId || null,
    },
  } as const;
}

export async function createNote(_prev: NoteFormState, formData: FormData): Promise<NoteFormState> {
  const user = await requireUser();
  const parsed = parseNoteForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const [note] = await db
    .insert(notes)
    .values({ ...parsed.values, authorId: user.id })
    .returning({ id: notes.id });

  revalidatePath("/", "layout");
  // Quick-add forms stay on the page they were submitted from.
  if (formData.get("stay") === "1") return {};
  redirect(`/notes/${note.id}`);
}

export async function updateNote(
  id: string,
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  await requireUser();
  if (!isUuid(id)) return { error: "This note no longer exists." };
  const parsed = parseNoteForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await db
    .update(notes)
    .set({ ...parsed.values, updatedAt: new Date() })
    .where(eq(notes.id, id));

  revalidatePath("/", "layout");
  redirect(`/notes/${id}`);
}

export async function deleteNote(id: string) {
  await requireUser();
  if (!isUuid(id)) return;
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath("/", "layout");
  redirect("/notes");
}
