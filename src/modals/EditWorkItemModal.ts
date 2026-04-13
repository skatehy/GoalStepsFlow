import { App, Modal, Notice, Setting } from "obsidian";
import { GoalStatus, UpdateWorkItemInput, WorkItem } from "types";
import { getI18nStrings } from "../i18n";

export class EditWorkItemModal extends Modal {
  private titleValue: string;
  private descriptionValue: string;
  private deadlineValue: string;
  private statusValue: GoalStatus;
  private onSubmit: (input: UpdateWorkItemInput) => Promise<void> | void;

  constructor(
    app: App,
    workItem: WorkItem,
    onSubmit: (input: UpdateWorkItemInput) => Promise<void> | void
  ) {
    super(app);
    this.titleValue = workItem.title;
    this.descriptionValue = workItem.description ?? "";
    this.deadlineValue = workItem.deadline ?? "";
    this.statusValue = workItem.status;
    this.onSubmit = onSubmit;
  }

  private isValidDateString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  onOpen() {
    const { contentEl } = this;
    const t = getI18nStrings();

    contentEl.empty();
    contentEl.createEl("h2", { text: t.workItem.form.editWorkItem });

    new Setting(contentEl)
      .setName(t.workItem.form.titleLabel)
      .addText((text) => {
        text.setValue(this.titleValue);
        text.setPlaceholder(t.workItem.form.titleLabel);
        text.onChange((value) => {
          this.titleValue = value;
        });
      });

    new Setting(contentEl)
      .setName(t.workItem.form.descriptionLabel)
      .setDesc(t.common.optional)
      .addTextArea((text) => {
        text.setValue(this.descriptionValue);
        text.setPlaceholder(t.workItem.form.descriptionLabel);
        text.inputEl.rows = 3;
        text.onChange((value) => {
          this.descriptionValue = value;
        });
      });

    new Setting(contentEl)
      .setName(t.workItem.form.deadlineLabel)
      .setDesc(t.common.optional)
      .addText((text) => {
        text.setValue(this.deadlineValue);
        text.setPlaceholder(t.workItem.form.deadlineLabel);
        text.onChange((value) => {
          this.deadlineValue = value.trim();
        });
      });

    new Setting(contentEl)
      .setName(t.workItem.form.statusLabel)
      .addDropdown((dropdown) => {
        dropdown.addOption("todo", t.workItem.statusLabels.todo);
        dropdown.addOption("in_progress", t.workItem.statusLabels.in_progress);
        dropdown.addOption("done", t.workItem.statusLabels.done);
        dropdown.addOption("paused", t.workItem.statusLabels.paused);
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
            new Notice(t.workItem.validation.emptyTitle);
            return;
          }

          if (this.deadlineValue && !this.isValidDateString(this.deadlineValue)) {
            new Notice(t.workItem.validation.invalidDeadline);
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
