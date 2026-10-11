import type { Metadata } from "next";
import { createTask } from "@/app/actions/tasks";
import { TaskForm } from "@/components/task-form";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { listUsers } from "@/lib/queries";

export const metadata: Metadata = { title: "New task" };

export default async function NewTaskPage() {
  const user = await requireUser();
  const users = await listUsers();
  return (
    <div className="max-w-2xl">
      <PageHeader title="New task" />
      <TaskForm
        action={createTask}
        users={users}
        defaultAssigneeId={user.id}
        cancelHref="/tasks"
        submitLabel="Create task"
      />
    </div>
  );
}
