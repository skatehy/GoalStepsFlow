import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import GoalTimelinePlugin from "../main";
import { Goal, CreateGoalInput } from "../types";
import { CreateGoalModal } from "../modals/CreateGoalModal";
import { getI18nStrings } from "../i18n";


export const VIEW_TYPE_GOAL_BOARD = "goal-board-view";

export class GoalBoardView extends ItemView {
  plugin: GoalTimelinePlugin;

  constructor(leaf: WorkspaceLeaf, plugin: GoalTimelinePlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_GOAL_BOARD;
  }

  getDisplayText(): string {
    return "Goal Board";
  }

  async onOpen() {
    this.render();
  }

  async onClose() {
    this.contentEl.empty();
  }

  render() {
    const t = getI18nStrings();
    const goals = this.plugin.data.goals as Goal[];

    this.contentEl.empty();

    this.contentEl.createEl("h2", { text: t.goal.board.title });

    this.renderToolbar(t);

    if (goals.length === 0) {
    this.contentEl.createEl("p", { text: t.goal.board.noGoals });
    return;
    }

    const listEl = this.contentEl.createDiv({ cls: "goal-board-list" });

    for (const goal of goals) {
    this.renderGoalCard(listEl, goal, t);
    }
  }

  renderToolbar(t: ReturnType<typeof getI18nStrings>) {
    const toolbarEl = this.contentEl.createDiv({ cls: "goal-board-toolbar" });

    const addGoalBtn = toolbarEl.createEl("button", { text: t.goal.board.addGoal });

    addGoalBtn.addEventListener("click", () => {
      new CreateGoalModal(this.app,async (input: CreateGoalInput) => {
        await this.plugin.createNewGoal(input);
      }).open();
    });
  }

  private renderGoalCard(container: HTMLElement, goal: Goal, t: ReturnType<typeof getI18nStrings>) {
    const cardEl = container.createDiv({ cls: "goal-card" });

    cardEl.createEl("h3", { text: goal.title });

    cardEl.createEl("p", {
      text: `${t.goal.detail.status}: ${goal.status}`,
    });

    if (goal.description) {
      cardEl.createEl("p", {
        text: `${t.goal.detail.description}: ${goal.description}`,
      });
    }

    cardEl.createEl("p", {
      text: `${t.goal.detail.createdAt}: ${goal.createdAt}`,
    });

    cardEl.createEl("p", {
      text: `${t.goal.detail.updatedAt}: ${goal.updatedAt}`,
    });

    if (goal.deadline) {
      cardEl.createEl("p", {
        text: `${t.goal.detail.deadline}: ${goal.deadline}`,
      });
    }
}
}
