"use client";

import Link from "next/link";
import { startTransition, useOptimistic, useState } from "react";
import { setTaskStatus } from "@/app/actions/tasks";
import type { TaskStatus } from "@/db/schema";
import { formatDate } from "@/lib/dates";
import { STATUSES } from "@/lib/labels";
import type { TaskRow } from "@/lib/queries";
import { DueLabel, EmptyState, PriorityBadge } from "./ui";

const DONE_PREVIEW = 15;

const NEXT_MOVES: Record<TaskStatus, { status: TaskStatus; label: string }[]> = {
  todo: [{ status: "in_progress", label: "Start" }],
  in_progress: [
    { status: "todo", label: "Back" },
    { status: "done", label: "Done" },
  ],
  done: [{ status: "in_progress", label: "Reopen" }],
};

export function TaskBoard({ tasks, today }: { tasks: TaskRow[]; today: string }) {
  const [optimisticTasks, applyMove] = useOptimistic(
    tasks,
    (state, move: { id: string; status: TaskStatus }) =>
      state.map((t) => (t.id === move.id ? { ...t, status: move.status } : t)),
  );
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [showAllDone, setShowAllDone] = useState(false);

  function move(id: string, status: TaskStatus) {
    startTransition(async () => {
      applyMove({ id, status });
      await setTaskStatus(id, status);
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {STATUSES.map((column) => {
        let items = optimisticTasks.filter((t) => t.status === column.value);
        if (column.value === "done") {
          items = items.toSorted((a, b) => (b.completedOn ?? "").localeCompare(a.completedOn ?? ""));
        }
        const hidden = column.value === "done" && !showAllDone ? Math.max(0, items.length - DONE_PREVIEW) : 0;
        const visible = hidden ? items.slice(0, DONE_PREVIEW) : items;

        return (
          <section
            key={column.value}
            aria-label={column.label}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(column.value);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const id = e.dataTransfer.getData("text/task-id");
              if (id) move(id, column.value);
            }}
            className={`rounded-xl border bg-surface-2/60 p-3 transition-colors ${
              dragOver === column.value ? "border-accent bg-accent-soft/40" : "border-transparent"
            }`}
          >
            <h2 className="mb-3 flex items-center justify-between px-1 text-sm font-semibold">
              {column.label}
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">{items.length}</span>
            </h2>

            <ul className="space-y-2">
              {visible.map((task) => (
                <li
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/task-id", task.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="card cursor-grab p-3 shadow-xs active:cursor-grabbing"
                >
                  <Link
                    href={`/tasks/${task.id}`}
                    className={`block text-sm font-medium hover:text-accent ${
                      task.status === "done" ? "text-muted line-through" : ""
                    }`}
                  >
                    {task.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <PriorityBadge priority={task.priority} />
                    {task.status === "done" && task.completedOn ? (
                      <span className="text-xs text-muted">Done {formatDate(task.completedOn)}</span>
                    ) : (
                      <DueLabel dueDate={task.dueDate} today={today} />
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-xs text-muted">
                      <span className="truncate">{task.assigneeName ?? "Unassigned"}</span>
                      {task.commentCount > 0 && (
                        <span className="flex shrink-0 items-center gap-0.5" title={`${task.commentCount} comments`}>
                          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                            <path d="M4 5h16v11H9l-5 4z" strokeLinejoin="round" />
                          </svg>
                          {task.commentCount}
                        </span>
                      )}
                    </span>
                    <span className="flex gap-1">
                      {NEXT_MOVES[task.status].map((m) => (
                        <button
                          key={m.status}
                          type="button"
                          onClick={() => move(task.id, m.status)}
                          className="rounded-md px-2 py-0.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-text"
                        >
                          {m.label}
                        </button>
                      ))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {items.length === 0 && <EmptyState>Nothing here</EmptyState>}
            {hidden > 0 && (
              <button
                type="button"
                onClick={() => setShowAllDone(true)}
                className="mt-2 w-full rounded-md py-1.5 text-xs font-medium text-muted hover:bg-surface"
              >
                Show {hidden} more
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}
