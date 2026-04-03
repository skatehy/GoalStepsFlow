import { App, Modal, Notice, Setting } from "obsidian";

export class CreateGoalModal extends Modal {
  private titleValue = "";
  private onSubmit: (title: string) => Promise<void> | void;

  constructor(app: App, onSubmit: (title: string) => Promise<void> | void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.empty();
    contentEl.createEl("h2", { text: "新建目标" });

    new Setting(contentEl)
      .setName("目标标题")
      .addText((text) => {
        text.setPlaceholder("请输入目标标题");
        text.onChange((value) => {
          this.titleValue = value;
        });
      });

    new Setting(contentEl).addButton((btn) => {
      btn.setButtonText("创建");
      btn.setCta();

      btn.onClick(async () => {
        const title = this.titleValue.trim();

        if (!title) {
          new Notice("目标标题不能为空");
          return;
        }

        await this.onSubmit(title);
        this.close();
      });
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}