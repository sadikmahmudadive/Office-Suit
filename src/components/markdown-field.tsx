"use client";

import { useState } from "react";
import { Markdown } from "./markdown";

/** A textarea with Write / Preview tabs for Markdown content. */
export function MarkdownField({
  id,
  name,
  defaultValue = "",
  rows = 6,
  placeholder,
  required,
  label,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  label?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);

  const tab = (active: boolean) =>
    `rounded-md px-2.5 py-1 text-xs font-medium ${active ? "bg-surface text-text shadow-xs" : "text-muted hover:text-text"}`;

  return (
    <div>
      <div className="mb-1 flex items-end justify-between gap-2">
        {label ? (
          <label htmlFor={id} className="label mb-0">
            {label}
          </label>
        ) : (
          <span />
        )}
        <div className="flex rounded-lg bg-surface-2 p-0.5" role="tablist" aria-label="Editor mode">
          <button type="button" role="tab" aria-selected={!preview} className={tab(!preview)} onClick={() => setPreview(false)}>
            Write
          </button>
          <button type="button" role="tab" aria-selected={preview} className={tab(preview)} onClick={() => setPreview(true)}>
            Preview
          </button>
        </div>
      </div>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        required={required}
        hidden={preview}
        className="input leading-relaxed"
      />
      {preview && (
        <div className="min-h-24 rounded-lg border border-border bg-surface px-3 py-2">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-muted">Nothing to preview.</p>}
        </div>
      )}
      <p className="mt-1 text-xs text-muted">
        Markdown works: **bold**, _italic_, - lists, - [ ] checklists, [links](https://example.com), # headings.
      </p>
    </div>
  );
}
