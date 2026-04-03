import { Notice, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, VIEW_TYPE_TIMEFLOW } from "./constants";
import { AddTaskModal } from "./modals/AddTaskModal";
import { TimeflowSettingTab } from "./settings/TimeflowSettingTab";
import type { TimeflowSettings, TimeflowStore, TimeflowTask } from "./types";
import { sortTasks, createTaskId } from "./utils/task";
import { todayString } from "./utils/date";
import { TimeflowView } from "./views/TimeflowView";

export default class TimeflowStarterPlugin extends Plugin {
  settings: TimeflowSettings = DEFAULT_SETTINGS;
  tasks: TimeflowTask[] = [];
  selectedDate = todayString();

  async onload(): Promise<void> {
    await this.loadStore();

    this.registerView(VIEW_TYPE_TIMEFLOW, (leaf) => new TimeflowView(leaf, this));

    this.addRibbonIcon("calendar", "打开 Timeflow 面板", async () => {
      await this.activateView();
    });

    this.addCommand({
      id: "open-timeflow-view",
      name: "打开时间流面板",
      callback: async () => {
        await this.activateView();
      },
    });

    this.addCommand({
      id: "add-task-for-selected-date",
      name: "为当前日期新增任务",
      callback: async () => {
        await this.activateView();
        this.openAddTaskModal(this.selectedDate);
      },
    });

    this.addCommand({
      id: "open-today-view",
      name: "打开今天的时间流",
      callback: async () => {
        this.selectedDate = todayString();
        await this.activateView();
      },
    });

    this.addSettingTab(new TimeflowSettingTab(this.app, this));
  }

  async onunload(): Promise<void> {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMEFLOW).forEach((leaf) => leaf.detach());
  }

  async loadStore(): Promise<void> {
    const loaded = (await this.loadData()) as Partial<TimeflowStore> | null;
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...(loaded?.settings ?? {}),
    };
    this.tasks = loaded?.tasks ?? [];
  }

  async saveStore(): Promise<void> {
    await this.saveData({
      settings: this.settings,
      tasks: this.tasks,
    } satisfies TimeflowStore);
  }

  async activateView(): Promise<void> {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMEFLOW)[0];

    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false);
      if (!leaf) {
        new Notice("无法创建侧边栏视图");
        return;
      }

      await leaf.setViewState({ type: VIEW_TYPE_TIMEFLOW, active: true });
    }

    await this.app.workspace.revealLeaf(leaf);
    await this.refreshViews();
  }

  openAddTaskModal(date: string): void {
    new AddTaskModal(this.app, this, date).open();
  }

  getTasksForDate(date: string): TimeflowTask[] {
    return sortTasks(this.tasks.filter((task) => task.date === date));
  }

  async createTask(task: Omit<TimeflowTask, "id">): Promise<void> {
    const id = createTaskId();
    this.tasks.push({ id, ...task });
    await this.saveStore();
    await this.refreshViews();
    new Notice("任务已创建");
  }

  async toggleTask(id: string): Promise<void> {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) return;

    task.status = task.status === "done" ? "todo" : "done";
    await this.saveStore();
    await this.refreshViews();
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks = this.tasks.filter((item) => item.id !== id);
    await this.saveStore();
    await this.refreshViews();
    new Notice("任务已删除");
  }

  async refreshViews(): Promise<void> {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMEFLOW)) {
      const view = leaf.view;
      if (view instanceof TimeflowView) {
        await view.render();
      }
    }
  }
}
