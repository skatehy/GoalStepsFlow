import type { Plugin } from "obsidian";

export type TaskStatus = "todo" | "done";

export interface TimeflowTask {
  id: string;
  title: string;
  date: string;      // YYYY-MM-DD
  start: string;     // HH:mm
  duration: number;  // minutes
  status: TaskStatus;
}

export interface TimeflowSettings {
  dayStartHour: number;
  dayEndHour: number;
  defaultDuration: number;
}

export interface TimeflowStore {
  settings: TimeflowSettings;
  tasks: TimeflowTask[];
}

export interface TimeflowPluginApi {
  settings: TimeflowSettings;
  selectedDate: string;

  saveStore(): Promise<void>;
  refreshViews(): Promise<void>;

  openAddTaskModal(date: string): void;
  getTasksForDate(date: string): TimeflowTask[];

  createTask(task: Omit<TimeflowTask, "id">): Promise<void>;
  toggleTask(id: string): Promise<void>;
  deleteTask(id: string): Promise<void>;
}

export type TimeflowPluginContext = Plugin & TimeflowPluginApi;
