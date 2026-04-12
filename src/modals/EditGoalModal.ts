import { App, Modal, Notice, Setting } from "obsidian";
import { Goal, GoalStatus, UpdateGoalInput } from "types";
import { getI18nStrings } from "../i18n";

export class EditGoalModal extends Modal {
  private titleValue: string;
  private descriptionValue: string;
  private deadlineValue: string;
  private statusValue: GoalStatus;
  private onSubmit: (input: UpdateGoalInput) => Promise<void> | void;

  constructor(
    app: App,
    goal: Goal,
    onSubmit: (input: UpdateGoalInput) => Promise<void> | void
  ) {
    super(app);
    this.titleValue = goal.title;
    this.descriptionValue = goal.description ?? "";
    this.deadlineValue = goal.deadline ?? "";
    this.statusValue = goal.status;
    this.onSubmit = onSubmit;
  }

  private isValidDateString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  onOpen() {
    const { contentEl } = this;
    const t = getI18nStrings();

    contentEl.empty();
    contentEl.createEl("h2", { text: t.goal.form.editGoal });

    new Setting(contentEl)
      .setName(t.goal.form.titleLabel)
      .addText((text) => {
        text.setValue(this.titleValue);
        text.setPlaceholder(t.goal.form.titleLabel);
        text.onChange((value) => {
          this.titleValue = value;
        });
      });

    new Setting(contentEl)
      .setName(t.goal.form.descriptionLabel)
      .setDesc(t.common.optional)
      .addTextArea((text) => {
        text.setValue(this.descriptionValue);
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
        text.setValue(this.deadlineValue);
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
        dropdown.setValue(this.statusValue);
        dropdown.onChange((value) => {
          this.statusValue = value as GoalStatus;
        });
      });

    new Setting(contentEl)
      .addButton((btn) => {
        btn.setButtonText(t.common.cancel);
        btn.onClick(() => this.close());
      })
      .addButton((btn) => {
        btn.setButtonText(t.common.save);
        btn.setCta();

        btn.onClick(async () => {
          const title = this.titleValue.trim();

          if (!title) {
            new Notice(t.goal.validation.emptyTitle);
            return;
          }

          if (this.deadlineValue && !this.isValidDateString(this.deadlineValue)) {
            new Notice(t.goal.validation.invalidDeadline);
            return;
          }

          await this.onSubmit({
            title,
            description: this.descriptionValue.trim() || undefined,
            deadline: this.deadlineValue || undefined,
            status: this.statusValue,
          });

          this.close();
        });
      });
  }

  onClose() {
    this.contentEl.empty();
  }
}
