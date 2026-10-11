import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/buttons";
import { DueLabel, EmptyState, KindBadge, PageHeader, PriorityBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import {
  addDays,
  addMonths,
  endOfMonth,
  formatDate,
  formatRange,
  isISODate,
  startOfMonth,
  startOfWeek,
  todayISO,
} from "@/lib/dates";
import { noteKindLabel } from "@/lib/labels";
import { getSummary, type NoteRow, type TaskRow } from "@/lib/queries";

export const metadata: Metadata = { title: "Summary" };

type Period = "week" | "month";

function periodRange(period: Period, date: string) {
  if (period === "week") {
    const from = startOfWeek(date);
    return { from, to: addDays(from, 6), next: addDays(from, 7), prev: addDays(from, -7) };
  }
  const from = startOfMonth(date);
  return { from, to: endOfMonth(from), next: addMonths(from, 1), prev: addMonths(from, -1) };
}

export default async function SummaryPage({ searchParams }: PageProps<"/summary">) {
  const user = await requireUser();
  const params = await searchParams;
  const today = todayISO();
  const period: Period = params.period === "month" ? "month" : "week";
  const date = typeof params.date === "string" && isISODate(params.date) ? params.date : today;
  const mine = params.who === "me";

  const range = periodRange(period, date);
  const nextRange = periodRange(period, range.next);
  const summary = await getSummary({
    from: range.from,
    to: range.to,
    nextFrom: nextRange.from,
    nextTo: nextRange.to,
    today,
    assigneeId: mine ? user.id : undefined,
  });

  const href = (overrides: Record<string, string | undefined>) => {
    const query = { period, date, who: mine ? "me" : undefined, ...overrides };
    const search = new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1])));
    return `/summary?${search}`;
  };

  const periodName = period === "week" ? "week" : "month";
  const isCurrent = today >= range.from && today <= range.to;
  const report = buildReport({
    title: `${mine ? `${user.name} — ` : ""}Work summary, ${formatRange(range.from, range.to)}`,
    nextLabel: `Planned for next ${periodName} (${formatRange(nextRange.from, nextRange.to)})`,
    ...summary,
  });

  const toggle = (active: boolean) =>
    `rounded-md px-3 py-1 text-sm font-medium ${active ? "bg-surface text-text shadow-xs" : "text-muted hover:text-text"}`;

  return (
    <>
      <PageHeader
        title="Summary"
        description={`${formatRange(range.from, range.to)}${isCurrent ? ` · this ${periodName}` : ""}`}
        actions={<CopyButton text={report} label="Copy as text" />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-surface-2 p-1">
          <Link href={href({ period: "week" })} className={toggle(period === "week")}>
            Week
          </Link>
          <Link href={href({ period: "month" })} className={toggle(period === "month")}>
            Month
          </Link>
        </div>
        <div className="flex rounded-lg bg-surface-2 p-1">
          <Link href={href({ who: undefined })} className={toggle(!mine)}>
            Whole team
          </Link>
          <Link href={href({ who: "me" })} className={toggle(mine)}>
            Just me
          </Link>
        </div>
        <div className="flex gap-1">
          <Link href={href({ date: range.prev })} className="btn" aria-label={`Previous ${periodName}`}>
            ←
          </Link>
          <Link href={href({ date: undefined })} className="btn">
            This {periodName}
          </Link>
          <Link href={href({ date: range.next })} className="btn" aria-label={`Next ${periodName}`}>
            →
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Completed" count={summary.completed.length} empty={`Nothing completed this ${periodName}.`}>
          <TaskList tasks={summary.completed} today={today} showCompleted />
        </Section>

        <Section title="Work log" count={summary.workLog.length} empty={`No notes logged this ${periodName}.`}>
          <ul className="divide-y divide-border">
            {summary.workLog.map((note) => (
              <li key={note.id} className="px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>{formatDate(note.noteDate, { weekday: "short" })}</span>·
                  <span>{note.authorName ?? "Former member"}</span>
                  <KindBadge kind={note.kind} />
                </div>
                <Link href={`/notes/${note.id}`} className="mt-0.5 block font-medium hover:text-accent">
                  {note.title}
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="In progress now" count={summary.inProgress.length} empty="Nothing in progress.">
          <TaskList tasks={summary.inProgress} today={today} />
        </Section>

        <Section
          title={`Planned for next ${periodName}`}
          subtitle={formatRange(nextRange.from, nextRange.to)}
          count={summary.upcoming.length}
          empty={`Nothing due next ${periodName}.`}
        >
          <TaskList tasks={summary.upcoming} today={today} />
        </Section>

        {summary.overdue.length > 0 && (
          <Section title="Overdue" count={summary.overdue.length} tone="text-danger" empty="">
            <TaskList tasks={summary.overdue} today={today} />
          </Section>
        )}
      </div>

      <details className="card mt-8 p-4">
        <summary className="cursor-pointer text-sm font-medium">Preview the copied text</summary>
        <pre className="mt-3 overflow-x-auto text-xs leading-relaxed whitespace-pre-wrap text-muted">{report}</pre>
      </details>
    </>
  );
}

function Section({
  title,
  subtitle,
  count,
  empty,
  tone = "",
  children,
}: {
  title: string;
  subtitle?: string;
  count: number;
  empty: string;
  tone?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className={`mb-2 flex items-baseline gap-2 text-lg font-semibold ${tone}`}>
        {title}
        <span className="text-sm font-normal text-muted">
          {count}
          {subtitle && ` · ${subtitle}`}
        </span>
      </h2>
      {count === 0 ? <EmptyState>{empty}</EmptyState> : <div className="card">{children}</div>}
    </section>
  );
}

function TaskList({ tasks, today, showCompleted }: { tasks: TaskRow[]; today: string; showCompleted?: boolean }) {
  return (
    <ul className="divide-y divide-border">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <Link href={`/tasks/${task.id}`} className="block truncate font-medium hover:text-accent">
              {task.title}
            </Link>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
              <span>{task.assigneeName ?? "Unassigned"}</span>
              {showCompleted && task.completedOn ? (
                <span>· done {formatDate(task.completedOn, { weekday: "short" })}</span>
              ) : (
                <DueLabel dueDate={task.dueDate} today={today} />
              )}
            </div>
          </div>
          <PriorityBadge priority={task.priority} />
        </li>
      ))}
    </ul>
  );
}

function buildReport(data: {
  title: string;
  nextLabel: string;
  completed: TaskRow[];
  workLog: NoteRow[];
  inProgress: TaskRow[];
  upcoming: TaskRow[];
  overdue: TaskRow[];
}) {
  const who = (t: TaskRow) => (t.assigneeName ? ` (${t.assigneeName})` : "");
  const due = (t: TaskRow) => (t.dueDate ? ` — due ${formatDate(t.dueDate)}` : "");
  const section = (heading: string, lines: string[]) =>
    `## ${heading}\n${lines.length ? lines.join("\n") : "- None"}\n`;

  return [
    `# ${data.title}\n`,
    section(
      "Completed",
      data.completed.map((t) => `- ${t.title}${who(t)}`),
    ),
    section(
      "Work log",
      data.workLog.map(
        (n) => `- ${formatDate(n.noteDate, { weekday: "short" })}: ${n.title}${n.kind !== "log" ? ` [${noteKindLabel(n.kind)}]` : ""}${n.authorName ? ` (${n.authorName})` : ""}`,
      ),
    ),
    section(
      "In progress",
      data.inProgress.map((t) => `- ${t.title}${who(t)}${due(t)}`),
    ),
    section(
      data.nextLabel,
      data.upcoming.map((t) => `- ${t.title}${who(t)}${due(t)}`),
    ),
    data.overdue.length ? section("Overdue", data.overdue.map((t) => `- ${t.title}${who(t)}${due(t)}`)) : "",
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}
