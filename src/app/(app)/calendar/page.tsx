import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui";
import type { TaskPriority } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { addDays, addMonths, endOfMonth, formatDate, startOfMonth, startOfWeek, todayISO } from "@/lib/dates";
import { listNotes, listTasksInRange, type NoteRow, type TaskRow } from "@/lib/queries";

export const metadata: Metadata = { title: "Calendar" };

const MAX_PER_DAY = 3;

const priorityDot: Record<TaskPriority, string> = {
  high: "bg-danger",
  medium: "bg-warn",
  low: "bg-muted",
};

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  await requireUser();
  const params = await searchParams;
  const today = todayISO();
  const month =
    typeof params.month === "string" && /^\d{4}-\d{2}$/.test(params.month)
      ? `${params.month}-01`
      : startOfMonth(today);

  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(month);
  const gridEnd = addDays(startOfWeek(monthEnd), 6);

  const [tasks, notes] = await Promise.all([
    listTasksInRange(gridStart, gridEnd),
    listNotes({ from: gridStart, to: gridEnd }),
  ]);

  // A task sits on its due date; finished tasks without one sit on the day they were completed.
  const tasksByDay = new Map<string, TaskRow[]>();
  for (const task of tasks) {
    const day = task.dueDate ?? task.completedOn;
    if (day) tasksByDay.set(day, [...(tasksByDay.get(day) ?? []), task]);
  }
  const notesByDay = new Map<string, NoteRow[]>();
  for (const note of notes) notesByDay.set(note.noteDate, [...(notesByDay.get(note.noteDate) ?? []), note]);

  const days: string[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);
  const weekdays = days.slice(0, 7).map((d) => formatDate(d, { weekday: "short", month: undefined, day: undefined }));
  const monthParam = (iso: string) => iso.slice(0, 7);

  return (
    <>
      <PageHeader
        title={formatDate(month, { month: "long", year: "numeric", day: undefined })}
        description="Task due dates and notes by day."
        actions={
          <>
            <Link href={`/calendar?month=${monthParam(addMonths(month, -1))}`} className="btn" aria-label="Previous month">
              ←
            </Link>
            <Link href="/calendar" className="btn">
              Today
            </Link>
            <Link href={`/calendar?month=${monthParam(addMonths(month, 1))}`} className="btn" aria-label="Next month">
              →
            </Link>
          </>
        }
      />

      {/* Month grid on larger screens */}
      <div className="card hidden overflow-hidden md:block">
        <div className="grid grid-cols-7 border-b border-border bg-surface-2 text-xs font-medium text-muted">
          {weekdays.map((w) => (
            <div key={w} className="px-2 py-2">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayTasks = tasksByDay.get(day) ?? [];
            const dayNotes = notesByDay.get(day) ?? [];
            const inMonth = day.slice(0, 7) === month.slice(0, 7);
            const extra = Math.max(0, dayTasks.length - MAX_PER_DAY);
            return (
              <div
                key={day}
                className={`group min-h-28 border-border p-1.5 ${i % 7 ? "border-l" : ""} ${i >= 7 ? "border-t" : ""} ${
                  inMonth ? "" : "bg-surface-2/50"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-xs ${
                      day === today ? "bg-accent font-semibold text-accent-text" : inMonth ? "" : "text-muted"
                    }`}
                  >
                    {Number(day.slice(8))}
                  </span>
                  <Link
                    href={`/notes/new?date=${day}`}
                    className="text-xs text-muted opacity-0 group-hover:opacity-100 hover:text-accent focus:opacity-100"
                    aria-label={`Add note on ${formatDate(day)}`}
                  >
                    + note
                  </Link>
                </div>
                <ul className="space-y-0.5">
                  {dayTasks.slice(0, MAX_PER_DAY).map((task) => (
                    <li key={task.id}>
                      <Link
                        href={`/tasks/${task.id}`}
                        title={task.title}
                        className="flex items-center gap-1 rounded px-1 py-0.5 text-xs hover:bg-surface-2"
                      >
                        <span className={`size-1.5 shrink-0 rounded-full ${priorityDot[task.priority]}`} />
                        <span className={`truncate ${task.status === "done" ? "text-muted line-through" : ""}`}>
                          {task.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {extra > 0 && <li className="px-1 text-xs text-muted">+{extra} more</li>}
                </ul>
                {dayNotes.length > 0 && (
                  <Link
                    href={dayNotes.length === 1 ? `/notes/${dayNotes[0].id}` : `/notes?date=${day}`}
                    className="mt-1 block truncate rounded px-1 text-xs text-accent hover:underline"
                    title={dayNotes.map((n) => n.title).join("\n")}
                  >
                    {dayNotes.length === 1 ? `✎ ${dayNotes[0].title}` : `✎ ${dayNotes.length} notes`}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda list on phones */}
      <div className="space-y-4 md:hidden">
        {days
          .filter((d) => d.slice(0, 7) === month.slice(0, 7) && (tasksByDay.has(d) || notesByDay.has(d)))
          .map((day) => (
            <section key={day}>
              <h2 className={`mb-1 text-sm font-semibold ${day === today ? "text-accent" : "text-muted"}`}>
                {formatDate(day, { weekday: "long" })}
              </h2>
              <ul className="card divide-y divide-border">
                {(tasksByDay.get(day) ?? []).map((task) => (
                  <li key={task.id}>
                    <Link href={`/tasks/${task.id}`} className="flex items-center gap-2 px-3 py-2 text-sm">
                      <span className={`size-2 shrink-0 rounded-full ${priorityDot[task.priority]}`} />
                      <span className={task.status === "done" ? "text-muted line-through" : ""}>{task.title}</span>
                    </Link>
                  </li>
                ))}
                {(notesByDay.get(day) ?? []).map((note) => (
                  <li key={note.id}>
                    <Link href={`/notes/${note.id}`} className="block px-3 py-2 text-sm text-accent">
                      ✎ {note.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        {!days.some((d) => d.slice(0, 7) === month.slice(0, 7) && (tasksByDay.has(d) || notesByDay.has(d))) && (
          <EmptyState>Nothing scheduled this month.</EmptyState>
        )}
      </div>
    </>
  );
}
