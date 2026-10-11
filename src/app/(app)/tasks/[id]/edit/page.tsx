import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateTask } from "@/app/actions/tasks";
import { TaskForm } from "@/components/task-form";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getTask, listUsers } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit task" };

export default async function EditTaskPage({ params }: PageProps<"/tasks/[id]/edit">) {
  await requireUser();
  const { id } = await params;
  const [task, users] = await Promise.all([getTask(id), listUsers()]);
  if (!task) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Edit task" />
      <TaskForm
        action={updateTask.bind(null, task.id)}
        task={task}
        users={users}
        cancelHref={`/tasks/${task.id}`}
        submitLabel="Save changes"
      />
    </div>
  );
}
