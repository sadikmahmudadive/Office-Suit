import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateNote } from "@/app/actions/notes";
import { NoteForm } from "@/components/note-form";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getNote, listOpenTaskOptions, listTags } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit note" };

export default async function EditNotePage({ params }: PageProps<"/notes/[id]/edit">) {
  await requireUser();
  const { id } = await params;
  const [note, taskOptions, tags] = await Promise.all([getNote(id), listOpenTaskOptions(), listTags()]);
  if (!note) notFound();

  // Keep the current link selectable even if that task is already done.
  if (note.taskId && note.taskTitle && !taskOptions.some((t) => t.id === note.taskId)) {
    taskOptions.unshift({ id: note.taskId, title: note.taskTitle });
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Edit note" />
      <NoteForm
        action={updateNote.bind(null, note.id)}
        note={note}
        defaults={{ noteDate: note.noteDate }}
        taskOptions={taskOptions}
        tagSuggestions={tags}
        cancelHref={`/notes/${note.id}`}
        submitLabel="Save changes"
      />
    </div>
  );
}
