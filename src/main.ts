import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { DEFAULT_DATA } from "./constants";
import { getI18nStrings } from "./i18n";
import { CreateGoalInput, Goal, GoalPluginData, UpdateGoalInput } from "./types";
import { formatDateTime } from "./utils/time";
import { GoalBoardView, VIEW_TYPE_GOAL_BOARD } from "./views/GoalBoardView";

export default class GoalTimelinePlugin extends Plugin {
  data: GoalPluginData = DEFAULT_DATA;

  async onload() {
    await this.loadPluginData();

    this.registerView(
      VIEW_TYPE_GOAL_BOARD,
      (leaf: WorkspaceLeaf) => new GoalBoardView(leaf, this)
    );

    this.addCommand({
      id: "open-goal-board",
      name: "Open Goal Board",
      callback: async () => {
        await this.activateGoalBoardView();
      },
    });

    this.addRibbonIcon("target", "Open goal board", async () => {
      await this.activateGoalBoardView();
    });

    new Notice("GoalStepsFlow plugin loaded");
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_GOAL_BOARD);
  }

  async loadPluginData() {
    this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
  }

  async savePluginData() {
    await this.saveData(this.data);
  }

  async activateGoalBoardView() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;

    const leaves = workspace.getLeavesOfType(VIEW_TYPE_GOAL_BOARD);

    if (leaves.length > 0) {
      leaf = leaves[0] ?? null;
    } else {
      leaf = workspace.getLeaf(true);

      if (!leaf) {
        new Notice("Failed to open goal board");
        return;
      }

      await leaf.setViewState({
        type: VIEW_TYPE_GOAL_BOARD,
        active: true,
      });
    }

    if (leaf) {
      await workspace.revealLeaf(leaf);
    }
  }

  async createNewGoal(input: CreateGoalInput) {
    const t = getI18nStrings();
    const now = formatDateTime();
    const title = input.title.trim();

    if (title.length === 0) {
      new Notice(t.goal.validation.emptyTitle);
      return;
    }

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title,
      description: input.description?.trim() || undefined,
      deadline: input.deadline?.trim() || undefined,
      status: input.status ?? "todo",
      createdAt: now,
      updatedAt: now,
    };

    this.data.goals.push(newGoal);
    await this.savePluginData();
    this.refreshGoalBoardView();
  }

  async updateGoal(goalId: string, input: UpdateGoalInput) {
    const t = getI18nStrings();
    const goal = this.data.goals.find((item) => item.id === goalId);

    if (!goal) {
      new Notice("Goal not found");
      return;
    }

    const title = input.title?.trim() ?? goal.title;
    if (title.length === 0) {
      new Notice(t.goal.validation.emptyTitle);
      return;
    }

    goal.title = title;
    goal.description = input.description?.trim() || undefined;
    goal.deadline = input.deadline?.trim() || undefined;
    goal.status = input.status ?? goal.status;
    goal.updatedAt = formatDateTime();

    await this.savePluginData();
    this.refreshGoalBoardView();
  }

  refreshGoalBoardView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL_BOARD);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view instanceof GoalBoardView) {
        view.render();
      }
    }
  }
}
