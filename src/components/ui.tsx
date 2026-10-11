import Link from "next/link";
import type { ReactNode } from "react";
import type { NoteKind, TaskPriority, TaskStatus } from "@/db/schema";
import { daysBetween, relativeDay, todayISO } from "@/lib/dates";
import { noteKindLabel, priorityLabel, statusLabel } from "@/lib/labels";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const priorityStyles: Record<TaskPriority, string> = {
  high: "bg-danger-soft text-danger",
  medium: "bg-warn-soft text-warn",
  low: "bg-surface-2 text-muted",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <span className={`chip ${priorityStyles[priority]}`}>{priorityLabel(priority)}</span>;
}

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-surface-2 text-muted",
  in_progress: "bg-accent-soft text-accent",
  done: "bg-ok-soft text-ok",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`chip ${statusStyles[status]}`}>{statusLabel(status)}</span>;
}

export function KindBadge({ kind }: { kind: NoteKind }) {
  return <span className="chip bg-surface-2 text-muted">{noteKindLabel(kind)}</span>;
}

/** Due date that turns orange when close and red when overdue (for open tasks). */
// Client components must pass `today` from the server so the office time zone is used.
export function DueLabel({
  dueDate,
  done,
  today = todayISO(),
}: {
  dueDate: string | null;
  done?: boolean;
  today?: string;
}) {
  if (!dueDate) return null;
  const diff = daysBetween(today, dueDate);
  const tone = done ? "text-muted" : diff < 0 ? "text-danger font-medium" : diff <= 2 ? "text-warn" : "text-muted";
  return (
    <span className={`text-xs ${tone}`}>
      {!done && diff < 0 ? "Overdue · " : "Due "}
      {relativeDay(dueDate, today)}
    </span>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/notes?tag=${encodeURIComponent(tag)}`}
          className="chip bg-accent-soft text-accent hover:underline"
        >
          #{tag}
        </Link>
      ))}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
      {children}
    </p>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}
