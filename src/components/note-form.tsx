"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { NoteFormState } from "@/app/actions/notes";
import type { Note } from "@/db/schema";
import { NOTE_KINDS } from "@/lib/labels";
import { MarkdownField } from "./markdown-field";
import { FormError } from "./ui";
import { useFormAction } from "./use-form-action";

export function NoteForm({
  action,
  note,
  defaults,
  taskOptions,
  tagSuggestions,
  cancelHref,
  submitLabel,
}: {
  action: (prev: NoteFormState, formData: FormData) => Promise<NoteFormState>;
  note?: Pick<Note, "title" | "content" | "kind" | "noteDate" | "tags" | "taskId">;
  defaults: { noteDate: string; taskId?: string; kind?: Note["kind"] };
  taskOptions: { id: string; title: string }[];
  tagSuggestions: string[];
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
          maxLength={200}
          defaultValue={note?.title}
          placeholder="e.g. Finished vendor contract review"
          className="input"
          autoFocus={!note}
        />
      </div>

      <MarkdownField
        id="content"
        name="content"
        label="Notes"
        rows={10}
        defaultValue={note?.content}
        placeholder="What happened, decisions made, next steps…"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="kind" className="label">
            Type
          </label>
          <select id="kind" name="kind" defaultValue={note?.kind ?? defaults.kind ?? "log"} className="input">
            {NOTE_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="noteDate" className="label">
            Date
          </label>
          <input
            id="noteDate"
            name="noteDate"
            type="date"
            required
            defaultValue={note?.noteDate ?? defaults.noteDate}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="taskId" className="label">
            Related task
          </label>
          <select id="taskId" name="taskId" defaultValue={note?.taskId ?? defaults.taskId ?? ""} className="input">
            <option value="">None</option>
            {taskOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="label">
          Tags <span className="font-normal text-muted">(comma separated)</span>
        </label>
        <input
          id="tags"
          name="tags"
          list="tag-suggestions"
          defaultValue={note?.tags.join(", ")}
          placeholder="e.g. finance, client-abc"
          className="input"
        />
        <datalist id="tag-suggestions">
          {tagSuggestions.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
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

/** A small "what did you work on?" box that logs a note for today without leaving the page. */
export function QuickNoteForm({
  action,
}: {
  action: (prev: NoteFormState, formData: FormData) => Promise<NoteFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="stay" value="1" />
      <input type="hidden" name="kind" value="log" />
      <textarea
        name="content"
        rows={3}
        required
        placeholder="What did you work on today?"
        className="input"
        aria-label="Quick work log entry"
      />
      <FormError message={state?.error} />
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Log it"}
        </button>
      </div>
    </form>
  );
}
