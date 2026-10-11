"use client";

import { useState, useTransition } from "react";
import { createResetLink, removeMember, setMemberRole } from "@/app/actions/team";
import type { UserRole } from "@/db/schema";
import { CopyButton } from "./buttons";

/** Admin controls for one teammate: reset link, role change and removal. */
export function MemberActions({
  member,
  isSelf,
}: {
  member: { id: string; name: string; role: UserRole };
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [resetUrl, setResetUrl] = useState<string>();

  function run(action: () => Promise<{ error?: string }>) {
    setError(undefined);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
    });
  }

  const small = "rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-surface-2 disabled:opacity-60";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          className={small}
          disabled={pending}
          onClick={() =>
            run(async () => {
              const result = await createResetLink(member.id);
              if (result.path) setResetUrl(`${window.location.origin}${result.path}`);
              return result;
            })
          }
        >
          Password reset link
        </button>
        <button
          type="button"
          className={small}
          disabled={pending}
          onClick={() => run(() => setMemberRole(member.id, member.role === "admin" ? "member" : "admin"))}
        >
          {member.role === "admin" ? "Remove admin" : "Make admin"}
        </button>
        {!isSelf && (
          <button
            type="button"
            className={`${small} text-danger hover:bg-danger-soft`}
            disabled={pending}
            onClick={() => {
              if (confirm(`Remove ${member.name} from the team? Their tasks become unassigned; their notes stay.`)) {
                run(() => removeMember(member.id));
              }
            }}
          >
            Remove
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {resetUrl && (
        <div className="rounded-lg bg-surface-2 p-2 text-xs">
          <p className="mb-1.5 text-muted">
            Send this link to {member.name}. It works once and expires in 24 hours.
          </p>
          <div className="flex items-center gap-2">
            <input readOnly value={resetUrl} className="input py-1 text-xs" aria-label="Reset link" onFocus={(e) => e.currentTarget.select()} />
            <CopyButton text={resetUrl} />
          </div>
        </div>
      )}
    </div>
  );
}
