import "server-only";
import { and, asc, desc, eq, getTableColumns, gte, ilike, isNull, lt, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { notes, taskComments, tasks, users, type NoteKind } from "@/db/schema";

const assignee = alias(users, "assignee");
const author = alias(users, "author");

const taskColumns = {
  ...getTableColumns(tasks),
  assigneeName: assignee.name,
  // Correlated subqueries name the outer table explicitly: Drizzle leaves columns
  // unqualified in single-table selects, which would bind them to the inner table.
  commentCount: sql<number>`(select count(*) from task_comments c where c.task_id = "tasks"."id")`.mapWith(Number),
};
const noteColumns = {
  ...getTableColumns(notes),
  authorName: author.name,
  taskTitle: tasks.title,
};

export type TaskRow = Awaited<ReturnType<typeof listTasks>>[number];
export type NoteRow = Awaited<ReturnType<typeof listNotes>>[number];

export const isUuid = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// Open tasks first by due date (no date last), then by priority.
const taskOrder = [
  sql`${tasks.dueDate} asc nulls last`,
  sql`case ${tasks.priority} when 'high' then 0 when 'medium' then 1 else 2 end`,
  desc(tasks.createdAt),
];

function selectTasks() {
  return db.select(taskColumns).from(tasks).leftJoin(assignee, eq(tasks.assigneeId, assignee.id));
}

function selectNotes() {
  return db
    .select(noteColumns)
    .from(notes)
    .leftJoin(author, eq(notes.authorId, author.id))
    .leftJoin(tasks, eq(notes.taskId, tasks.id));
}

export async function listUsers() {
  return db.select({ id: users.id, name: users.name }).from(users).orderBy(asc(users.name));
}

/** assigneeId: a member's id, or null for unassigned tasks. */
export async function listTasks(filter: { assigneeId?: string | null; q?: string } = {}) {
  const where: SQL[] = [];
  if (filter.assigneeId === null) where.push(isNull(tasks.assigneeId));
  else if (filter.assigneeId) where.push(eq(tasks.assigneeId, filter.assigneeId));
  if (filter.q) {
    const pattern = `%${escapeLike(filter.q)}%`;
    where.push(or(ilike(tasks.title, pattern), ilike(tasks.description, pattern))!);
  }
  return selectTasks()
    .where(and(...where))
    .orderBy(...taskOrder);
}

export async function getTask(id: string) {
  if (!isUuid(id)) return null;
  const [task] = await selectTasks().where(eq(tasks.id, id));
  return task ?? null;
}

/** Open tasks for pickers, e.g. linking a note to a task. */
export async function listOpenTaskOptions() {
  return db
    .select({ id: tasks.id, title: tasks.title })
    .from(tasks)
    .where(ne(tasks.status, "done"))
    .orderBy(desc(tasks.updatedAt));
}

export async function listNotes(
  filter: {
    q?: string;
    kind?: NoteKind;
    tag?: string;
    authorId?: string;
    taskId?: string;
    from?: string;
    to?: string;
    limit?: number;
  } = {},
) {
  const where: SQL[] = [];
  if (filter.q) {
    const pattern = `%${escapeLike(filter.q)}%`;
    where.push(or(ilike(notes.title, pattern), ilike(notes.content, pattern))!);
  }
  if (filter.kind) where.push(eq(notes.kind, filter.kind));
  if (filter.tag) where.push(sql`${filter.tag} = any(${notes.tags})`);
  if (filter.authorId) where.push(eq(notes.authorId, filter.authorId));
  if (filter.taskId) where.push(eq(notes.taskId, filter.taskId));
  if (filter.from) where.push(gte(notes.noteDate, filter.from));
  if (filter.to) where.push(lte(notes.noteDate, filter.to));

  const query = selectNotes()
    .where(and(...where))
    .orderBy(desc(notes.noteDate), desc(notes.createdAt));
  return filter.limit ? query.limit(filter.limit) : query;
}

export async function getNote(id: string) {
  if (!isUuid(id)) return null;
  const [note] = await selectNotes().where(eq(notes.id, id));
  return note ?? null;
}

export async function listTags() {
  const rows = await db.execute<{ tag: string }>(
    sql`select distinct unnest(${notes.tags}) as tag from ${notes} order by tag`,
  );
  return rows.map((r) => r.tag);
}

/** Tasks with a due date or completion date inside a range, for the calendar. */
export async function listTasksInRange(from: string, to: string) {
  return selectTasks()
    .where(
      or(
        and(gte(tasks.dueDate, from), lte(tasks.dueDate, to)),
        and(eq(tasks.status, "done"), gte(tasks.completedOn, from), lte(tasks.completedOn, to)),
      ),
    )
    .orderBy(...taskOrder);
}

export async function getSummary(opts: {
  from: string;
  to: string;
  nextFrom: string;
  nextTo: string;
  today: string;
  assigneeId?: string;
}) {
  const mine = opts.assigneeId ? eq(tasks.assigneeId, opts.assigneeId) : undefined;
  const open = ne(tasks.status, "done");

  const [completed, inProgress, upcoming, overdue, workLog] = await Promise.all([
    selectTasks()
      .where(and(mine, gte(tasks.completedOn, opts.from), lte(tasks.completedOn, opts.to)))
      .orderBy(asc(tasks.completedOn)),
    selectTasks()
      .where(and(mine, eq(tasks.status, "in_progress")))
      .orderBy(...taskOrder),
    selectTasks()
      .where(and(mine, open, gte(tasks.dueDate, opts.nextFrom), lte(tasks.dueDate, opts.nextTo)))
      .orderBy(...taskOrder),
    selectTasks()
      .where(and(mine, open, lt(tasks.dueDate, opts.today)))
      .orderBy(...taskOrder),
    listNotes({ from: opts.from, to: opts.to, authorId: opts.assigneeId }),
  ]);

  return { completed, inProgress, upcoming, overdue, workLog };
}

export async function getDashboard(userId: string, today: string, weekEnd: string) {
  const mine = eq(tasks.assigneeId, userId);
  const open = ne(tasks.status, "done");

  const [myOpen, recentNotes, counts] = await Promise.all([
    selectTasks().where(and(mine, open)).orderBy(...taskOrder).limit(8),
    listNotes({ limit: 6 }),
    db
      .select({
        overdue: sql<number>`count(*) filter (where ${tasks.status} <> 'done' and ${tasks.dueDate} < ${today})`.mapWith(Number),
        dueThisWeek: sql<number>`count(*) filter (where ${tasks.status} <> 'done' and ${tasks.dueDate} between ${today} and ${weekEnd})`.mapWith(Number),
        inProgress: sql<number>`count(*) filter (where ${tasks.status} = 'in_progress')`.mapWith(Number),
        doneLast7Days: sql<number>`count(*) filter (where ${tasks.completedOn} > ${today}::date - 7)`.mapWith(Number),
      })
      .from(tasks),
  ]);

  return { myOpen, recentNotes, counts: counts[0] };
}


export async function listComments(taskId: string) {
  return db
    .select({ ...getTableColumns(taskComments), authorName: author.name })
    .from(taskComments)
    .leftJoin(author, eq(taskComments.authorId, author.id))
    .where(eq(taskComments.taskId, taskId))
    .orderBy(asc(taskComments.createdAt));
}

/** Everyone on the team with a few activity numbers for the team page. */
export async function listMembers(today: string) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      openTasks: sql<number>`(select count(*) from tasks t where t.assignee_id = "users"."id" and t.status <> 'done')`.mapWith(Number),
      overdueTasks: sql<number>`(select count(*) from tasks t where t.assignee_id = "users"."id" and t.status <> 'done' and t.due_date < ${today})`.mapWith(Number),
      doneLast30Days: sql<number>`(select count(*) from tasks t where t.assignee_id = "users"."id" and t.completed_on > ${today}::date - 30)`.mapWith(Number),
      lastNoteOn: sql<string | null>`(select max(n.note_date)::text from notes n where n.author_id = "users"."id")`,
    })
    .from(users)
    .orderBy(asc(users.name));
}
