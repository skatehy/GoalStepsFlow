import { App, Modal, Setting } from "obsidian";
import { WorkItem } from "types";
import { getI18nStrings } from "../i18n";

export class DeleteWorkItemModal extends Modal {
  private workItem: WorkItem;
  private onConfirm: () => Promise<void> | void;

  constructor(app: App, workItem: WorkItem, onConfirm: () => Promise<void> | void) {
    super(app);
    this.workItem = workItem;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    const t = getI18nStrings();

    contentEl.empty();
    contentEl.createEl("h2", { text: t.workItem.form.deleteWorkItem });
    contentEl.createEl("p", { text: t.workItem.board.deleteConfirm });
    contentEl.createEl("p", { text: this.workItem.title });

    new Setting(contentEl)
      .addButton((btn) => {
        btn.setButtonText(t.common.cancel);
        btn.onClick(() => this.close());
      })
      .addButton((btn) => {
        btn.setButtonText(t.common.delete);
        btn.setWarning();
        btn.onClick(async () => {
          await this.onConfirm();
          this.close();
        });
      });
  }

  onClose() {
    this.contentEl.empty();
  }
}
