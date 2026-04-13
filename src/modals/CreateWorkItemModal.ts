import { App, Modal, Notice, Setting } from "obsidian";
import { CreateWorkItemInput,GoalStatus } from "types";
import { getI18nStrings } from "../i18n";

export class CreateWorkItemModal extends Modal{
  private titleValue = "";
  private descriptionValue = "";
  private deadlineValue = "";
  private statusValue: GoalStatus = "todo";
  private onSubmit: (input: Omit<CreateWorkItemInput, "goalId">) => Promise<void> | void;

  constructor(app: App, onSubmit: (input: Omit<CreateWorkItemInput, "goalId">) => Promise<void> | void){
    super(app);
    this.onSubmit = onSubmit;
  }

  private isValidDateString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  onOpen(): Promise<void> | void {
    const { contentEl } = this;
    const t = getI18nStrings();

    contentEl.empty();
    contentEl.createEl("h2",{ text:t.workItem.form.createWorkItem});

    new Setting(contentEl)
      .setName(t.workItem.form.titleLabel)
      .addText((text) => {
        text.setPlaceholder(t.workItem.form.titleLabel);
        text.onChange((value) => {
          this.titleValue = value;
        });    
      });     
    
    new Setting(contentEl)
      .setName(t.workItem.form.descriptionLabel)
      .setDesc(t.common.optional)
      .addTextArea((text) => {
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
        text.setPlaceholder(t.workItem.form.deadlineLabel);
        text.onChange((value) => {
          this.deadlineValue = value.trim();
        });
      });

    new Setting(contentEl)
      .setName(t.goal.form.statusLabel)
      .addDropdown((dropdown) => {
        dropdown.addOption("todo", t.workItem.statusLabels.todo);
        dropdown.addOption("in_progress", t.workItem.statusLabels.in_progress);
        dropdown.addOption("done", t.workItem.statusLabels.done);
        dropdown.addOption("paused", t.workItem.statusLabels.paused);
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

  onClose(): void {
      this.contentEl.empty();
  }
}