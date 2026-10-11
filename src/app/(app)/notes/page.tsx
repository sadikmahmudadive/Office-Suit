import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, KindBadge, PageHeader, TagList } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { daysBetween, formatDate, isISODate, relativeDay, todayISO } from "@/lib/dates";
import { isNoteKind, NOTE_KINDS } from "@/lib/labels";
import { plainText } from "@/lib/markdown";
import { listNotes, listTags, type NoteRow } from "@/lib/queries";

export const metadata: Metadata = { title: "Notes" };

const LIMIT = 200;

export default async function NotesPage({ searchParams }: PageProps<"/notes">) {
  const user = await requireUser();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const kind = isNoteKind(params.kind) ? params.kind : undefined;
  const tag = typeof params.tag === "string" ? params.tag : undefined;
  const mine = params.who === "me";
  const date = typeof params.date === "string" && isISODate(params.date) ? params.date : undefined;

  const [notes, tags] = await Promise.all([
    listNotes({
      q: q || undefined,
      kind,
      tag,
      authorId: mine ? user.id : undefined,
      from: date,
      to: date,
      limit: LIMIT,
    }),
    listTags(),
  ]);

  // Group consecutive notes under a heading per day.
  const today = todayISO();
  const groups: { date: string; notes: NoteRow[] }[] = [];
  for (const note of notes) {
    const last = groups.at(-1);
    if (last?.date === note.noteDate) last.notes.push(note);
    else groups.push({ date: note.noteDate, notes: [note] });
  }

  const filtered = Boolean(q || kind || tag || mine || date);

  return (
    <>
      <PageHeader
        title="Notes & work log"
        description="Everything the team has logged, newest first."
        actions={
          <Link href="/notes/new" className="btn btn-primary">
            New note
          </Link>
        }
      />

      <form className="card mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto_auto]">
        <input name="q" defaultValue={q} placeholder="Search notes…" className="input" aria-label="Search notes" />
        <select name="kind" defaultValue={kind ?? ""} className="input" aria-label="Note type">
          <option value="">All types</option>
          {NOTE_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <select name="tag" defaultValue={tag ?? ""} className="input" aria-label="Tag">
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              #{t}
            </option>
          ))}
        </select>
        <select name="who" defaultValue={mine ? "me" : ""} className="input" aria-label="Author">
          <option value="">Everyone</option>
          <option value="me">Only mine</option>
        </select>
        {date && <input type="hidden" name="date" value={date} />}
        <div className="flex gap-2">
          <button className="btn">Filter</button>
          {filtered && (
            <Link href="/notes" className="btn">
              Clear
            </Link>
          )}
        </div>
      </form>

      {date && (
        <p className="mb-4 text-sm text-muted">
          Showing notes from {formatDate(date, { weekday: "long", year: "numeric" })}.
        </p>
      )}

      {groups.length === 0 ? (
        <EmptyState>
          {filtered ? "No notes match these filters." : "No notes yet. Start by logging what you worked on today."}
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.date}>
              <h2 className="mb-2 text-sm font-semibold text-muted">
                {formatDate(group.date, {
                  weekday: "long",
                  year: group.date.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric",
                })}
                {Math.abs(daysBetween(today, group.date)) < 7 && (
                  <span className="font-normal"> · {relativeDay(group.date, today)}</span>
                )}
              </h2>
              <ul className="space-y-2">
                {group.notes.map((note) => (
                  <li key={note.id} className="card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <Link href={`/notes/${note.id}`} className="font-medium hover:text-accent">
                        {note.title}
                      </Link>
                      <KindBadge kind={note.kind} />
                    </div>
                    {note.content && (
                      <p className="mt-1 line-clamp-3 text-sm whitespace-pre-line text-muted">{plainText(note.content)}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span>{note.authorName ?? "Former member"}</span>
                      {note.taskId && (
                        <Link href={`/tasks/${note.taskId}`} className="hover:text-accent">
                          ↳ {note.taskTitle}
                        </Link>
                      )}
                      <TagList tags={note.tags} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {notes.length === LIMIT && (
            <p className="text-center text-sm text-muted">
              Showing the latest {LIMIT} notes. Use search or filters to find older ones.
            </p>
          )}
        </div>
      )}
    </>
  );
}
