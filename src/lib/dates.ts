// All calendar dates in the app are plain "YYYY-MM-DD" strings. Arithmetic is
// done on UTC midnights so it never shifts across time zones.

const TIME_ZONE = process.env.APP_TIMEZONE || "UTC";
const WEEK_START = Number(process.env.WEEK_START ?? 1) % 7;

const DAY_MS = 86_400_000;

function toDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function isISODate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toDate(value).getTime());
}

/** Today's date in the office time zone. */
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDays(iso: string, days: number) {
  return toISO(new Date(toDate(iso).getTime() + days * DAY_MS));
}

export function daysBetween(from: string, to: string) {
  return Math.round((toDate(to).getTime() - toDate(from).getTime()) / DAY_MS);
}

export function weekdayIndex(iso: string) {
  return toDate(iso).getUTCDay();
}

export function weekStartDay() {
  return WEEK_START;
}

export function startOfWeek(iso: string) {
  const offset = (weekdayIndex(iso) - WEEK_START + 7) % 7;
  return addDays(iso, -offset);
}

export function startOfMonth(iso: string) {
  return `${iso.slice(0, 7)}-01`;
}

export function addMonths(iso: string, months: number) {
  const d = toDate(startOfMonth(iso));
  d.setUTCMonth(d.getUTCMonth() + months);
  return toISO(d);
}

export function endOfMonth(iso: string) {
  return addDays(addMonths(iso, 1), -1);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return toDate(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...opts,
  });
}

export function formatTimestamp(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRange(from: string, to: string) {
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  return `${formatDate(from, sameYear ? {} : { year: "numeric" })} – ${formatDate(to, { year: "numeric" })}`;
}

/** A short human label like "Today", "Tomorrow", "3 days ago" or "Oct 12". */
export function relativeDay(iso: string, today = todayISO()) {
  const diff = daysBetween(today, iso);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  if (diff < -1 && diff > -7) return `${-diff} days ago`;
  return formatDate(iso, iso.slice(0, 4) === today.slice(0, 4) ? {} : { year: "numeric" });
}
