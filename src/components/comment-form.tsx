"use client";

import { useState } from "react";
import type { CommentFormState } from "@/app/actions/tasks";
import { MarkdownField } from "./markdown-field";
import { FormError } from "./ui";
import { useFormAction } from "./use-form-action";

export function CommentForm({
  action,
}: {
  action: (prev: CommentFormState, formData: FormData) => Promise<CommentFormState>;
}) {
  // Bumping the key remounts the field, clearing it after a comment posts.
  const [fieldKey, setFieldKey] = useState(0);
  const [state, onSubmit, pending] = useFormAction(async (prev, formData) => {
    const result = await action(prev, formData);
    if (!result?.error) setFieldKey((k) => k + 1);
    return result;
  });

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-4">
      <MarkdownField key={fieldKey} id="comment-body" name="body" rows={3} placeholder="Add a comment or update…" />
      <FormError message={state?.error} />
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Posting…" : "Comment"}
        </button>
      </div>
    </form>
  );
}
