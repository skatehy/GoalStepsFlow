import { App, Modal, Notice, Setting } from "obsidian";
import type { TimeflowPluginApi } from "../types";

export class AddTaskModal extends Modal {
  plugin: TimeflowPluginApi;
  defaultDate: string;

  constructor(app: App, plugin: TimeflowPluginApi, defaultDate: string) {
    super(app);
    this.plugin = plugin;
    this.defaultDate = defaultDate;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "新增时间块任务" });

    const wrapper = contentEl.createDiv({ cls: "timeflow-modal-grid" });

    const titleLabel = wrapper.createEl("label", { text: "任务标题" });
    const titleInput = titleLabel.createEl("input");
    titleInput.type = "text";
    titleInput.placeholder = "例如：写算法题 / 晚间复盘";

    const dateLabel = wrapper.createEl("label", { text: "日期" });
    const dateInput = dateLabel.createEl("input");
    dateInput.type = "date";
    dateInput.value = this.defaultDate;

    const timeLabel = wrapper.createEl("label", { text: "开始时间" });
    const timeInput = timeLabel.createEl("input");
    timeInput.type = "time";
    timeInput.value = "09:00";

    const durationLabel = wrapper.createEl("label", { text: "时长（分钟）" });
    const durationInput = durationLabel.createEl("input");
    durationInput.type = "number";
    durationInput.min = "5";
    durationInput.step = "5";
    durationInput.value = String(this.plugin.settings.defaultDuration);

    new Setting(contentEl)
      .addButton((button) =>
        button
          .setButtonText("保存")
          .setCta()
          .onClick(async () => {
            const title = titleInput.value.trim();
            const date = dateInput.value;
            const start = timeInput.value;
            const duration = Number(durationInput.value);

            if (!title) {
              new Notice("请输入任务标题");
              return;
            }

            if (!date || !start || Number.isNaN(duration) || duration <= 0) {
              new Notice("请完整填写日期、时间和时长");
              return;
            }

            await this.plugin.createTask({
              title,
              date,
              start,
              duration,
              status: "todo",
            });

            this.plugin.selectedDate = date;
            this.close();
          })
      )
      .addButton((button) => button.setButtonText("取消").onClick(() => this.close()));
  }
}
