import { App, Modal, Notice, Setting } from "obsidian";
import { CreateGoalInput,GoalStatus } from "types";
import { getI18nStrings } from "../i18n";

export class CreateGoalModal extends Modal {
  private titleValue = "";
  private descriptionValue = "";
  private deadlineValue = "";
  private statusValue: GoalStatus = "todo";
  private onSubmit: (input: CreateGoalInput) => Promise<void> | void;

  private isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

  constructor(app: App, onSubmit: (input: CreateGoalInput) => Promise<void> | void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    const t = getI18nStrings();

    contentEl.empty();
    contentEl.createEl("h2", { text: t.goal.form.createGoal });

    new Setting(contentEl)
      .setName(t.goal.form.titleLabel)
      .addText((text) => {
        text.setPlaceholder(t.goal.form.titleLabel);
        text.onChange((value) => {
          this.titleValue = value;
        });    
      });

    new Setting(contentEl)
      .setName(t.goal.form.descriptionLabel)
      .setDesc(t.common.optional)
      .addTextArea((text) => {
        text.setPlaceholder(t.goal.form.descriptionLabel);
        text.inputEl.rows = 3;
        text.onChange((value) => {
          this.descriptionValue = value;
        });
      });
    
    new Setting(contentEl)
      .setName(t.goal.form.deadlineLabel)
      .setDesc(t.common.optional)
      .addText((text) => {
        text.setPlaceholder(t.goal.form.deadlineLabel);
        text.onChange((value) => {
          this.deadlineValue = value.trim();
        });
      });

    new Setting(contentEl)
      .setName(t.goal.form.statusLabel)
      .addDropdown((dropdown) => {
        dropdown.addOption("todo", t.goal.statusLabels.todo);
        dropdown.addOption("in_progress", t.goal.statusLabels.in_progress);
        dropdown.addOption("done", t.goal.statusLabels.done);
        dropdown.addOption("paused", t.goal.statusLabels.paused);
        dropdown.onChange((value) => {
          this.statusValue = value as GoalStatus;
        });
      });


    new Setting(contentEl).addButton((btn) => {
      btn.setButtonText(t.common.create);
      btn.setCta();

      btn.onClick(async () => {
        const title = this.titleValue.trim();

        if (!title) {
          new Notice(t.goal.validation.emptyTitle);
          return;
        }

        if(this.deadlineValue && !this.isValidDateString(this.deadlineValue)) {
          new Notice(t.goal.validation.invalidDeadline);
          return;
        }

        await this.onSubmit({
          title,
          description:this.descriptionValue,
          deadline:this.deadlineValue,
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