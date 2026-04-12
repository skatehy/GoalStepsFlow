import { ItemView, WorkspaceLeaf } from "obsidian";
import { EditGoalModal } from "../modals/EditGoalModal";
import { CreateGoalModal } from "../modals/CreateGoalModal";
import { getI18nStrings } from "../i18n";
import GoalTimelinePlugin from "../main";
import { CreateGoalInput, Goal } from "../types";

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
    const todoGoals = goals.filter((goal) => goal.status === "todo");
    const inProgressGoals = goals.filter((goal) => goal.status === "in_progress");
    const pausedGoals = goals.filter((goal) => goal.status === "paused");
    const doneGoals = goals.filter((goal) => goal.status === "done");

    this.contentEl.empty();

    const boardEl = this.contentEl.createDiv({ cls: "goal-board-view" });

    boardEl.createEl("h2", { text: t.goal.board.title });

    this.renderToolbar(boardEl, t);

    if (goals.length === 0) {
      boardEl.createEl("p", { text: t.goal.board.noGoals });
      return;
    }

    const sectionsEl = boardEl.createDiv({ cls: "goal-board-sections" });

    this.renderStatusSection(sectionsEl, t.goal.statusLabels.todo, "goal-board-section--todo", todoGoals, t);
    this.renderStatusSection(
      sectionsEl,
      t.goal.statusLabels.in_progress,
      "goal-board-section--in-progress",
      inProgressGoals,
      t
    );
    this.renderStatusSection(sectionsEl, t.goal.statusLabels.paused, "goal-board-section--paused", pausedGoals, t);
    this.renderStatusSection(sectionsEl, t.goal.statusLabels.done, "goal-board-section--done", doneGoals, t);
  }

  renderToolbar(container: HTMLElement, t: ReturnType<typeof getI18nStrings>) {
    const toolbarEl = container.createDiv({ cls: "goal-board-toolbar" });

    const addGoalBtn = toolbarEl.createEl("button", { text: t.goal.board.addGoal });

    addGoalBtn.addEventListener("click", () => {
      new CreateGoalModal(this.app, async (input: CreateGoalInput) => {
        await this.plugin.createNewGoal(input);
      }).open();
    });
  }

  private renderStatusSection(
    container: HTMLElement,
    sectionTitle: string,
    sectionClass: string,
    goals: Goal[],
    t: ReturnType<typeof getI18nStrings>
  ) {
    if (goals.length === 0) {
      return;
    }

    const sectionEl = container.createDiv({ cls: "goal-board-section" });

    sectionEl.addClass(sectionClass);

    sectionEl.createEl("h3", { text: sectionTitle });

    const listEl = sectionEl.createDiv({ cls: "goal-board-list" });

    for (const goal of goals) {
      this.renderGoalCard(listEl, goal, t);
    }
  }

  private renderGoalCard(container: HTMLElement, goal: Goal, t: ReturnType<typeof getI18nStrings>) {
    const cardEl = container.createDiv({ cls: "goal-card" });

    cardEl.createEl("h3", { text: goal.title });

    cardEl.createEl("p", {
      text: `${t.goal.detail.status}: ${t.goal.statusLabels[goal.status]}`,
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

    const actionsEl = cardEl.createDiv({ cls: "goal-card-actions" });
    const editBtn = actionsEl.createEl("button", {
      cls: "mod-cta",
      text: t.common.edit,
    });

    editBtn.addEventListener("click", () => {
      new EditGoalModal(this.app, goal, async (input) => {
        await this.plugin.updateGoal(goal.id, input);
      }).open();
    })
  }
}
