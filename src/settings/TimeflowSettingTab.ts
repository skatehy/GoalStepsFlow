import { App, PluginSettingTab, Setting } from "obsidian";
import type { TimeflowPluginContext } from "../types";

export class TimeflowSettingTab extends PluginSettingTab {
  plugin: TimeflowPluginContext;

  constructor(app: App, plugin: TimeflowPluginContext) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Timeflow 设置" });

    new Setting(containerEl)
      .setName("时间流开始小时")
      .setDesc("例如 6 代表从 06:00 开始渲染")
      .addText((text) =>
        text
          .setPlaceholder("6")
          .setValue(String(this.plugin.settings.dayStartHour))
          .onChange(async (value) => {
            const num = Number(value);
            if (Number.isNaN(num)) return;
            this.plugin.settings.dayStartHour = Math.max(0, Math.min(23, num));
            await this.plugin.saveStore();
            await this.plugin.refreshViews();
          })
      );

    new Setting(containerEl)
      .setName("时间流结束小时")
      .setDesc("例如 23 代表渲染到 23:00")
      .addText((text) =>
        text
          .setPlaceholder("23")
          .setValue(String(this.plugin.settings.dayEndHour))
          .onChange(async (value) => {
            const num = Number(value);
            if (Number.isNaN(num)) return;
            this.plugin.settings.dayEndHour = Math.max(
              this.plugin.settings.dayStartHour,
              Math.min(23, num)
            );
            await this.plugin.saveStore();
            await this.plugin.refreshViews();
          })
      );

    new Setting(containerEl)
      .setName("默认任务时长")
      .setDesc("新增任务时默认填入的分钟数")
      .addText((text) =>
        text
          .setPlaceholder("30")
          .setValue(String(this.plugin.settings.defaultDuration))
          .onChange(async (value) => {
            const num = Number(value);
            if (Number.isNaN(num) || num <= 0) return;
            this.plugin.settings.defaultDuration = num;
            await this.plugin.saveStore();
          })
      );
  }
}
