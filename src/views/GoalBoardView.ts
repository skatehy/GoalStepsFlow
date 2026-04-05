import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import GoalTimelinePlugin from "../main";
import { Goal, CreateGoalInput } from "../types";
import { CreateGoalModal } from "../modals/CreateGoalModal";

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
    this.contentEl.empty();

    this.contentEl.createEl("h2", { text: "Goal Board" });

    this.renderToolbar();

    const goals = this.plugin.data.goals as Goal[];

    if (goals.length === 0) {
    this.contentEl.createEl("p", { text: "还没有目标" });
    return;
    }

    const listEl = this.contentEl.createDiv({ cls: "goal-board-list" });

    for (const goal of goals) {
    this.renderGoalCard(listEl, goal);
    }
  }

  renderToolbar() {
    const toolbarEl = this.contentEl.createDiv({ cls: "goal-board-toolbar" });

    const addGoalBtn = toolbarEl.createEl("button", { text: "添加目标" });

    addGoalBtn.addEventListener("click", () => {
      new CreateGoalModal(this.app,async (input: CreateGoalInput) => {
        await this.plugin.createNewGoal(input);
      }).open();
    });
  }

  private renderGoalCard(container: HTMLElement, goal: Goal) {
    const cardEl = container.createDiv({ cls: "goal-card" });

    cardEl.createEl("h3", { text: goal.title });

    cardEl.createEl("p", {
      text: `状态: ${goal.status}`,
    });

    if (goal.description) {
      cardEl.createEl("p", {
        text: `描述: ${goal.description}`,
      });
    }

    cardEl.createEl("p", {
      text: `创建日期: ${goal.createdAt}`,
    });

    cardEl.createEl("p", {
      text: `更新时间: ${goal.updatedAt}`,
    });

    if (goal.deadline) {
      cardEl.createEl("p", {
        text: `截止时间: ${goal.deadline}`,
      });
    }
}
}
