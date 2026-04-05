import { App, Modal, Notice, Setting } from "obsidian";
import { CreateGoalInput,GoalStatus } from "types";

export class CreateGoalModal extends Modal {
  private titleValue = "";
  private descriptionValue = "";
  private deadlineValue = "";
  private statusValue: GoalStatus = "todo";
  private onSubmit: (input: CreateGoalInput) => Promise<void> | void;

  constructor(app: App, onSubmit: (input: CreateGoalInput) => Promise<void> | void) {
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

    new Setting(contentEl)
      .setName("目标描述")
      .setDesc("可选")
      .addTextArea((text) => {
        text.setPlaceholder("请输入目标描述");
        text.inputEl.rows = 3;
        text.onChange((value) => {
          this.descriptionValue = value;
        });
      });
    
    new Setting(contentEl)
      .setName("截止日期")
      .setDesc("可选")  
      .addText((text) => {
        text.inputEl.type = "date";
        text.onChange((value) => {
          this.deadlineValue = value;
        });
      });

    new Setting(contentEl)
      .setName("状态")
      .addDropdown((dropdown) => {
        dropdown.addOption("todo", "待办");
        dropdown.addOption("in_progress", "进行中");
        dropdown.addOption("done", "已完成");
        dropdown.addOption("paused", "暂停");
        dropdown.onChange((value) => {
          this.statusValue = value as GoalStatus;
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

        await this.onSubmit({
          title,
          description:this.descriptionValue.trim()||undefined,
          deadline:this.deadlineValue.trim()||undefined,
          status:this.statusValue,

        });
        
        this.close();
      });
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}