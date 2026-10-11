import type { NoteKind, TaskPriority, TaskStatus } from "@/db/schema";

export const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Upcoming" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const NOTE_KINDS: { value: NoteKind; label: string }[] = [
  { value: "log", label: "Work log" },
  { value: "meeting", label: "Meeting" },
  { value: "general", label: "General" },
];

export const statusLabel = (s: TaskStatus) => STATUSES.find((x) => x.value === s)!.label;
export const priorityLabel = (p: TaskPriority) => PRIORITIES.find((x) => x.value === p)!.label;
export const noteKindLabel = (k: NoteKind) => NOTE_KINDS.find((x) => x.value === k)!.label;

export const isStatus = (v: unknown): v is TaskStatus => STATUSES.some((x) => x.value === v);
export const isPriority = (v: unknown): v is TaskPriority => PRIORITIES.some((x) => x.value === v);
export const isNoteKind = (v: unknown): v is NoteKind => NOTE_KINDS.some((x) => x.value === v);
