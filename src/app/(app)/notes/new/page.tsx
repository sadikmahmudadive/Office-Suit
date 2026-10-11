import type { Metadata } from "next";
import { createNote } from "@/app/actions/notes";
import { NoteForm } from "@/components/note-form";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { isISODate, todayISO } from "@/lib/dates";
import { isNoteKind } from "@/lib/labels";
import { isUuid, listOpenTaskOptions, listTags } from "@/lib/queries";

export const metadata: Metadata = { title: "New note" };

export default async function NewNotePage({ searchParams }: PageProps<"/notes/new">) {
  await requireUser();
  const params = await searchParams;
  const [taskOptions, tags] = await Promise.all([listOpenTaskOptions(), listTags()]);

  return (
    <div className="max-w-2xl">
      <PageHeader title="New note" description="Log work you did, meeting notes, or anything worth remembering." />
      <NoteForm
        action={createNote}
        defaults={{
          noteDate: typeof params.date === "string" && isISODate(params.date) ? params.date : todayISO(),
          taskId: isUuid(params.task) ? params.task : undefined,
          kind: isNoteKind(params.kind) ? params.kind : undefined,
        }}
        taskOptions={taskOptions}
        tagSuggestions={tags}
        cancelHref="/notes"
        submitLabel="Save note"
      />
    </div>
  );
}
