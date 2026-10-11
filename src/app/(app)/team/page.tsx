import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { CopyButton } from "@/components/buttons";
import { MemberActions } from "@/components/member-actions";
import { PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { relativeDay, todayISO } from "@/lib/dates";
import { listMembers } from "@/lib/queries";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const user = await requireUser();
  const today = todayISO();
  const members = await listMembers(today);
  const isAdmin = user.role === "admin";

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const inviteCode = process.env.TEAM_INVITE_CODE;

  return (
    <>
      <PageHeader title="Team" description={`${members.length} ${members.length === 1 ? "member" : "members"}`} />

      <section className="card mb-8 p-5">
        <h2 className="mb-1 font-semibold">Invite teammates</h2>
        {inviteCode ? (
          <>
            <p className="mb-3 text-sm text-muted">
              Send them the sign-up link and the team invite code.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <code className="rounded-md bg-surface-2 px-2 py-1">{origin}/register</code>
              <CopyButton text={`${origin}/register`} label="Copy link" />
              <span className="text-muted">Code:</span>
              <code className="rounded-md bg-surface-2 px-2 py-1">{inviteCode}</code>
              <CopyButton text={inviteCode} label="Copy code" />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">
            Sign-ups are closed. {isAdmin ? "Set TEAM_INVITE_CODE in the environment variables to open them." : "Ask an admin."}
          </p>
        )}
      </section>

      <ul className="grid gap-3 md:grid-cols-2">
        {members.map((m) => (
          <li key={m.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {m.name}
                  {m.id === user.id && <span className="font-normal text-muted"> (you)</span>}
                </p>
                <p className="truncate text-sm text-muted">{m.email}</p>
              </div>
              {m.role === "admin" && <span className="chip shrink-0 bg-accent-soft text-accent">Admin</span>}
            </div>

            <dl className="my-4 grid grid-cols-3 gap-2 text-center">
              <Link href={`/tasks?assignee=${m.id}`} className="rounded-lg bg-surface-2 p-2 hover:ring-1 hover:ring-accent">
                <dt className="text-xs text-muted">Open tasks</dt>
                <dd className="text-lg font-semibold tabular-nums">{m.openTasks}</dd>
              </Link>
              <div className="rounded-lg bg-surface-2 p-2">
                <dt className="text-xs text-muted">Overdue</dt>
                <dd className={`text-lg font-semibold tabular-nums ${m.overdueTasks ? "text-danger" : ""}`}>{m.overdueTasks}</dd>
              </div>
              <div className="rounded-lg bg-surface-2 p-2">
                <dt className="text-xs text-muted">Done (30 days)</dt>
                <dd className="text-lg font-semibold tabular-nums text-ok">{m.doneLast30Days}</dd>
              </div>
            </dl>

            <p className="mb-3 text-xs text-muted">
              {m.lastNoteOn ? `Last note: ${relativeDay(m.lastNoteOn, today)}` : "No notes yet"}
            </p>

            {isAdmin && <MemberActions member={m} isSelf={m.id === user.id} />}
          </li>
        ))}
      </ul>
    </>
  );
}
