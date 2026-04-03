import { ItemView, WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_TIMEFLOW } from "../constants";
import type { TimeflowPluginApi } from "../types";
import { plusDays, readableDate, todayString } from "../utils/date";
export class TimeflowView extends ItemView {
  plugin: TimeflowPluginApi;

  constructor(leaf: WorkspaceLeaf, plugin: TimeflowPluginApi) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_TIMEFLOW;
  }

  getDisplayText(): string {
    return "Timeflow";
  }

  getIcon(): string {
    return "calendar";
  }

  async onOpen(): Promise<void> {
    await this.render();
  }

  async render(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass("timeflow-root");

    const toolbar = container.createDiv({ cls: "timeflow-toolbar" });
    const left = toolbar.createDiv({ cls: "timeflow-date-nav" });
    const right = toolbar.createDiv({ cls: "timeflow-actions" });

    const prevButton = left.createEl("button", { text: "←" });
    prevButton.onclick = async () => {
      this.plugin.selectedDate = plusDays(this.plugin.selectedDate, -1);
      await this.render();
    };

    left.createEl("strong", { text: readableDate(this.plugin.selectedDate) });

    const nextButton = left.createEl("button", { text: "→" });
    nextButton.onclick = async () => {
      this.plugin.selectedDate = plusDays(this.plugin.selectedDate, 1);
      await this.render();
    };

    const todayButton = right.createEl("button", { text: "今天" });
    todayButton.onclick = async () => {
      this.plugin.selectedDate = todayString();
      await this.render();
    };

    const addButton = right.createEl("button", { text: "+ 新任务" });
    addButton.onclick = () => this.plugin.openAddTaskModal(this.plugin.selectedDate);

    const tasks = this.plugin.getTasksForDate(this.plugin.selectedDate);
    const timeline = container.createDiv({ cls: "timeflow-timeline" });

    for (
      let hour = this.plugin.settings.dayStartHour;
      hour <= this.plugin.settings.dayEndHour;
      hour += 1
    ) {
      const row = timeline.createDiv({ cls: "timeflow-hour-row" });
      row.createDiv({
        cls: "timeflow-hour-label",
        text: `${String(hour).padStart(2, "0")}:00`,
      });

      const slot = row.createDiv({ cls: "timeflow-hour-slot" });
      const tasksInHour = tasks.filter((task) => Number(task.start.split(":")[0]) === hour);

      if (tasksInHour.length === 0) {
        slot.createDiv({ cls: "timeflow-empty", text: "空" });
        continue;
      }

      for (const task of tasksInHour) {
        const card = slot.createDiv({ cls: "timeflow-task-card" });
        if (task.status === "done") card.addClass("is-done");

        const head = card.createDiv({ cls: "timeflow-task-head" });
        head.createDiv({ cls: "timeflow-task-title", text: task.title });
        head.createDiv({ text: task.status === "done" ? "已完成" : "待办" });

        card.createDiv({
          cls: "timeflow-task-meta",
          text: `${task.start} · ${task.duration} 分钟`,
        });

        const buttons = card.createDiv({ cls: "timeflow-task-buttons" });
        const toggleBtn = buttons.createEl("button", {
          text: task.status === "done" ? "恢复" : "完成",
        });
        toggleBtn.onclick = async () => {
          await this.plugin.toggleTask(task.id);
        };

        const deleteBtn = buttons.createEl("button", { text: "删除" });
        deleteBtn.onclick = async () => {
          await this.plugin.deleteTask(task.id);
        };
      }
    }

    const footer = container.createDiv({ cls: "timeflow-footer" });
    footer.setText(`当前共有 ${tasks.length} 个任务。你可以先把它当成“今日时间块管理器”。`);
  }
}
