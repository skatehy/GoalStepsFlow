import { App, Modal, Notice, Setting } from "obsidian";
import { Goal } from "types";
import { getI18nStrings } from "../i18n";

export class DeleteGoalModal extends Modal {
    private goal: Goal;
    private onConfirm: () => Promise<void> | void;

    constructor(app: App, goal: Goal, onConfirm: () => Promise<void> | void){
        super(app);
        this.goal = goal;
        this.onConfirm = onConfirm;
    }

    onOpen() {
        const { contentEl } = this;
        const t = getI18nStrings();

        contentEl.empty();
        contentEl.createEl("h2", { text: t.goal.form.deleteGoal })
        contentEl.createEl("p", { text: t.goal.board.deleteConfirm })
        contentEl.createEl("p",{ text: this.goal.title });

        new Setting(contentEl)
            .addButton((btn) => {
                btn.setButtonText(t.common.cancel)
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

    onClose(): void {
        this.contentEl.empty();
    }
}