import type { TimeflowTask } from "../types";

export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function sortTasks(tasks: TimeflowTask[]): TimeflowTask[] {
  return [...tasks].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
}

export function createTaskId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}
