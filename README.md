# Office Notes

A small team app for tracking office work: what's coming up, what's in progress, what got done, and notes about it all.

- **Dashboard**: your open tasks, team counts (overdue, due soon, in progress, recently done), a quick "what did you work on?" log and recent notes.
- **Tasks**: a board with Upcoming / In progress / Done columns. Drag cards between columns or use the buttons on each card. Tasks have a due date, priority and assignee, plus a comment thread. Filter by any teammate or "Unassigned".
- **Notes**: a dated work log, meeting notes and general notes, with tags, search and an optional link to a task.
- **Calendar**: a month view of task due dates and notes. On phones it shows as a list.
- **Team**: everyone's open, overdue and recently finished tasks, and the invite link and code to share.
- **Account**: change your name, email or password. Changing your password signs you out on other devices.
- **Summary**: a weekly or monthly report (completed work, work log, in progress, planned next, overdue) for the team or just you, with a **Copy as text** button for status emails.

Notes, task details and comments support Markdown (bold, lists, checklists, tables, links) with a Write / Preview toggle.

Built with Next.js 16, Tailwind CSS 4, Drizzle ORM and Postgres (Neon).

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, click **Add New → Project** and import the repository.
3. Before the first deploy, open the project's **Storage** tab, click **Create Database → Neon**, and connect it to the project. This sets `DATABASE_URL` for you.
4. Under **Settings → Environment Variables**, add:
   - `AUTH_SECRET`: a long random string. Generate one with
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
   - `TEAM_INVITE_CODE`: a code you share with teammates so they can sign up.
   - `APP_TIMEZONE` (optional): your office time zone, for example `Asia/Dhaka` or `Europe/London`. It decides what "today" and "overdue" mean. Defaults to `UTC`.
   - `WEEK_START` (optional): `1` for Monday (default), `0` for Sunday, `6` for Saturday.
5. Deploy. Each deploy runs the database migrations automatically (the `vercel-build` script) before building.
6. Open the site and click **Create an account**. The first account doesn't need an invite code and becomes the **admin**. Everyone after that needs the code.

## Run locally

You need Node.js 20+ and a Postgres database. The easiest option is to reuse the Neon database from Vercel.

```bash
npm install
cp .env.example .env.local      # then fill in the values
# or, if the Vercel project is linked: npx vercel env pull .env.local
npm run db:migrate              # create the tables
npm run dev                     # http://localhost:3000
```

## Changing the database schema

Edit [src/db/schema.ts](src/db/schema.ts), then run `npm run db:generate` to create a migration file in `drizzle/`. Commit it, and the next Vercel deploy applies it. `npm run db:studio` opens a browser view of the data.

## Project layout

| Path | What's there |
| --- | --- |
| `src/app/(app)/` | Signed-in pages: dashboard, tasks, notes, calendar, summary |
| `src/app/(auth)/` | Sign-in and sign-up pages |
| `src/app/actions/` | Server actions that create, update and delete data |
| `src/lib/queries.ts` | Database reads |
| `src/lib/auth.ts`, `src/lib/session.ts`, `src/proxy.ts` | Sessions (signed cookie, 30 days) and route protection |
| `src/lib/dates.ts` | Date helpers (all dates are `YYYY-MM-DD` in the office time zone) |
| `src/db/schema.ts` | Tables: `users`, `tasks`, `task_comments`, `notes` |

## Admins

The first account is an admin. Admins can, from the **Team** page:

- **Create a password reset link** for a teammate who forgot their password. Send it to them yourself (chat, email). It works once and expires after 24 hours. There's no automatic email.
- **Make or remove admins.** The last admin can't remove their own admin role.
- **Remove a member** who left. Their tasks become unassigned; their notes and comments stay, shown as from a "Former member".

## Notes

- Everyone on the team can see and edit every task and note. Comments can be deleted by their author or an admin.
- Raw HTML in Markdown is shown as text, never run.
"# Office-Suit" 
