"use client";

import Link from "next/link";
import type { TaskFormState } from "@/app/actions/tasks";
import type { Task } from "@/db/schema";
import { PRIORITIES, STATUSES } from "@/lib/labels";
import { MarkdownField } from "./markdown-field";
import { FormError } from "./ui";
import { useFormAction } from "./use-form-action";

export function TaskForm({
  action,
  task,
  users,
  defaultAssigneeId,
  cancelHref,
  submitLabel,
}: {
  action: (prev: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  task?: Pick<Task, "title" | "description" | "status" | "priority" | "dueDate" | "assigneeId">;
  users: { id: string; name: string }[];
  defaultAssigneeId?: string;
  cancelHref: string;
  submitLabel: string;
}) {
  const [state, handleSubmit, pending] = useFormAction(action);

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-5">
      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={task?.title}
          placeholder="e.g. Prepare Q4 budget report"
          className="input"
          autoFocus={!task}
        />
      </div>

      <MarkdownField
        id="description"
        name="description"
        label="Details (optional)"
        rows={6}
        defaultValue={task?.description}
        placeholder="What needs to happen, links, context…"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="label">
            Status
          </label>
          <select id="status" name="status" defaultValue={task?.status ?? "todo"} className="input">
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="label">
            Priority
          </label>
          <select id="priority" name="priority" defaultValue={task?.priority ?? "medium"} className="input">
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dueDate" className="label">
            Due date
          </label>
          <input id="dueDate" name="dueDate" type="date" defaultValue={task?.dueDate ?? ""} className="input" />
        </div>
        <div>
          <label htmlFor="assigneeId" className="label">
            Assigned to
          </label>
          <select
            id="assigneeId"
            name="assigneeId"
            defaultValue={task ? (task.assigneeId ?? "") : (defaultAssigneeId ?? "")}
            className="input"
          >
            <option value="">Nobody yet</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FormError message={state?.error} />

      <div className="flex justify-end gap-2">
        <Link href={cancelHref} className="btn">
          Cancel
        </Link>
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
