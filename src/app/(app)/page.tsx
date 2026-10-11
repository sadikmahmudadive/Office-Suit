import Link from "next/link";
import { createNote } from "@/app/actions/notes";
import { QuickNoteForm } from "@/components/note-form";
import { DueLabel, EmptyState, KindBadge, PageHeader, PriorityBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { addDays, formatDate, relativeDay, todayISO } from "@/lib/dates";
import { getDashboard } from "@/lib/queries";

export default async function DashboardPage() {
  const user = await requireUser();
  const today = todayISO();
  const { myOpen, recentNotes, counts } = await getDashboard(user.id, today, addDays(today, 6));

  const stats = [
    { label: "Overdue", value: counts.overdue, href: "/summary", tone: counts.overdue ? "text-danger" : "" },
    { label: "Due in 7 days", value: counts.dueThisWeek, href: "/calendar", tone: "" },
    { label: "In progress", value: counts.inProgress, href: "/tasks", tone: "" },
    { label: "Done in last 7 days", value: counts.doneLast7Days, href: "/summary", tone: "text-ok" },
  ];

  return (
    <>
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]}`}
        description={formatDate(today, { weekday: "long", month: "long", year: "numeric" })}
        actions={
          <>
            <Link href="/notes/new" className="btn">
              New note
            </Link>
            <Link href="/tasks/new" className="btn btn-primary">
              New task
            </Link>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-4 transition-colors hover:border-accent">
            <p className={`text-3xl font-semibold tabular-nums ${s.tone}`}>{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
            <p className="text-xs text-muted">Whole team</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My open tasks</h2>
            <Link href="/tasks?assignee=me" className="text-sm text-accent hover:underline">
              View board
            </Link>
          </div>
          {myOpen.length === 0 ? (
            <EmptyState>Nothing assigned to you. Nice.</EmptyState>
          ) : (
            <ul className="card divide-y divide-border">
              {myOpen.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <Link href={`/tasks/${task.id}`} className="block truncate font-medium hover:text-accent">
                      {task.title}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2">
                      <DueLabel dueDate={task.dueDate} today={today} />
                      {task.status === "in_progress" && <span className="text-xs text-accent">In progress</span>}
                    </div>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-8">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Quick log</h2>
            <div className="card p-4">
              <QuickNoteForm action={createNote} />
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent notes</h2>
              <Link href="/notes" className="text-sm text-accent hover:underline">
                All notes
              </Link>
            </div>
            {recentNotes.length === 0 ? (
              <EmptyState>No notes yet.</EmptyState>
            ) : (
              <ul className="space-y-2">
                {recentNotes.map((note) => (
                  <li key={note.id} className="card px-4 py-3">
                    <Link href={`/notes/${note.id}`} className="block truncate font-medium hover:text-accent">
                      {note.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                      <span>{relativeDay(note.noteDate, today)}</span>·
                      <span className="truncate">{note.authorName ?? "Former member"}</span>
                      <KindBadge kind={note.kind} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
