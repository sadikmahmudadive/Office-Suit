import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteNote } from "@/app/actions/notes";
import { ConfirmButton } from "@/components/buttons";
import { Markdown } from "@/components/markdown";
import { KindBadge, TagList } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { getNote } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/notes/[id]">) {
  await requireUser();
  const note = await getNote((await params).id);
  return { title: note?.title ?? "Note" };
}

export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  await requireUser();
  const { id } = await params;
  const note = await getNote(id);
  if (!note) notFound();

  return (
    <article className="max-w-3xl">
      <Link href="/notes" className="text-sm text-muted hover:text-text">
        ← All notes
      </Link>

      <div className="mt-3 mb-2 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{note.title}</h1>
        <div className="flex gap-2">
          <Link href={`/notes/${note.id}/edit`} className="btn">
            Edit
          </Link>
          <ConfirmButton action={deleteNote.bind(null, note.id)} confirmText="Delete this note? This can't be undone.">
            Delete
          </ConfirmButton>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
        <span>{formatDate(note.noteDate, { weekday: "long", year: "numeric", month: "long" })}</span>
        <span>·</span>
        <span>{note.authorName ?? "Former member"}</span>
        <KindBadge kind={note.kind} />
        <TagList tags={note.tags} />
      </div>

      {note.taskId && (
        <p className="mb-4 text-sm">
          Related task:{" "}
          <Link href={`/tasks/${note.taskId}`} className="font-medium text-accent hover:underline">
            {note.taskTitle}
          </Link>
        </p>
      )}

      <div className="card p-5">
        {note.content ? (
          <Markdown className="prose-base">{note.content}</Markdown>
        ) : (
          <p className="text-muted">No details written.</p>
        )}
      </div>
    </article>
  );
}
