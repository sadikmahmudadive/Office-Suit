import Link from "next/link";
import { notFound } from "next/navigation";
import { addComment, deleteComment, deleteTask } from "@/app/actions/tasks";
import { ConfirmButton } from "@/components/buttons";
import { CommentForm } from "@/components/comment-form";
import { Markdown } from "@/components/markdown";
import { DueLabel, EmptyState, KindBadge, PriorityBadge, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate, formatTimestamp, relativeDay } from "@/lib/dates";
import { plainText } from "@/lib/markdown";
import { getTask, listComments, listNotes } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/tasks/[id]">) {
  await requireUser();
  const task = await getTask((await params).id);
  return { title: task?.title ?? "Task" };
}

export default async function TaskPage({ params }: PageProps<"/tasks/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const task = await getTask(id);
  if (!task) notFound();
  const [relatedNotes, comments] = await Promise.all([listNotes({ taskId: task.id }), listComments(task.id)]);

  return (
    <div className="max-w-3xl">
      <Link href="/tasks" className="text-sm text-muted hover:text-text">
        ← All tasks
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-3">
        <h1 className={`text-2xl font-semibold tracking-tight ${task.status === "done" ? "text-muted line-through" : ""}`}>
          {task.title}
        </h1>
        <div className="flex gap-2">
          <Link href={`/tasks/${task.id}/edit`} className="btn">
            Edit
          </Link>
          <ConfirmButton action={deleteTask.bind(null, task.id)} confirmText="Delete this task? This can't be undone.">
            Delete
          </ConfirmButton>
        </div>
      </div>

      <dl className="card mb-6 grid grid-cols-2 gap-4 p-5 text-sm sm:grid-cols-4">
        <div>
          <dt className="mb-1 text-muted">Status</dt>
          <dd>
            <StatusBadge status={task.status} />
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-muted">Priority</dt>
          <dd>
            <PriorityBadge priority={task.priority} />
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-muted">Assigned to</dt>
          <dd className="font-medium">{task.assigneeName ?? "Nobody yet"}</dd>
        </div>
        <div>
          <dt className="mb-1 text-muted">{task.status === "done" ? "Completed" : "Due"}</dt>
          <dd className="font-medium">
            {task.status === "done" && task.completedOn ? (
              formatDate(task.completedOn, { year: "numeric" })
            ) : task.dueDate ? (
              <>
                {formatDate(task.dueDate, { year: "numeric" })}
                <br />
                <DueLabel dueDate={task.dueDate} />
              </>
            ) : (
              "No due date"
            )}
          </dd>
        </div>
      </dl>

      {task.description && (
        <div className="card mb-8 p-5">
          <Markdown>{task.description}</Markdown>
        </div>
      )}

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">
          Comments <span className="text-sm font-normal text-muted">{comments.length}</span>
        </h2>
        {comments.length > 0 && (
          <ul className="mb-4 space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="card p-4">
                <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted">
                  <span>
                    <span className="font-medium text-text">{comment.authorName ?? "Former member"}</span> ·{" "}
                    {formatTimestamp(comment.createdAt)}
                  </span>
                  {(comment.authorId === user.id || user.role === "admin") && (
                    <ConfirmButton
                      action={deleteComment.bind(null, comment.id)}
                      confirmText="Delete this comment?"
                      className="rounded px-1.5 py-0.5 text-xs text-muted hover:bg-danger-soft hover:text-danger"
                    >
                      Delete
                    </ConfirmButton>
                  )}
                </div>
                <Markdown>{comment.body}</Markdown>
              </li>
            ))}
          </ul>
        )}
        <CommentForm action={addComment.bind(null, task.id)} />
      </section>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notes on this task</h2>
        <Link href={`/notes/new?task=${task.id}`} className="btn">
          Add note
        </Link>
      </div>
      {relatedNotes.length === 0 ? (
        <EmptyState>No notes yet. Log progress, decisions or meeting outcomes here.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {relatedNotes.map((note) => (
            <li key={note.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>{relativeDay(note.noteDate)}</span>·<span>{note.authorName ?? "Former member"}</span>
                <KindBadge kind={note.kind} />
              </div>
              <Link href={`/notes/${note.id}`} className="mt-1 block font-medium hover:text-accent">
                {note.title}
              </Link>
              {note.content && <p className="mt-1 line-clamp-2 text-sm text-muted">{plainText(note.content)}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
