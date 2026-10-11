import type { Metadata } from "next";
import Link from "next/link";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { TaskBoard } from "@/components/task-board";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { isUuid, listTasks, listUsers } from "@/lib/queries";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage({ searchParams }: PageProps<"/tasks">) {
  const user = await requireUser();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  // "me", "none" (unassigned) or a teammate's id.
  const assignee =
    params.assignee === "me" || params.assignee === "none" || isUuid(params.assignee) ? params.assignee : "";

  const [tasks, members] = await Promise.all([
    listTasks({
      assigneeId: assignee === "me" ? user.id : assignee === "none" ? null : assignee || undefined,
      q: q || undefined,
    }),
    listUsers(),
  ]);

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Drag cards between columns, or use the buttons on each card."
        actions={
          <Link href="/tasks/new" className="btn btn-primary">
            New task
          </Link>
        }
      />

      <form className="mb-5 flex flex-wrap items-center gap-2">
        <AutoSubmitSelect name="assignee" defaultValue={assignee} className="input w-auto py-1.5" aria-label="Assigned to">
          <option value="">Everyone&apos;s tasks</option>
          <option value="me">Assigned to me</option>
          <option value="none">Unassigned</option>
          <optgroup label="Teammates">
            {members
              .filter((m) => m.id !== user.id)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </optgroup>
        </AutoSubmitSelect>
        <input name="q" defaultValue={q} placeholder="Search tasks…" className="input max-w-xs flex-1 py-1.5" aria-label="Search tasks" />
        {(q || assignee) && (
          <Link href="/tasks" className="btn">
            Clear
          </Link>
        )}
      </form>

      <TaskBoard tasks={tasks} today={todayISO()} />
    </>
  );
}
