import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { GoalBoardView, VIEW_TYPE_GOAL_BOARD } from "./views/GoalBoardView";
import { Goal, GoalPluginData, WorkItem, CreateGoalInput } from "./types";
import { DEFAULT_DATA } from "./constants";
import { formatDateTime } from "./utils/time";
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
      leaf = leaves[0];
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

    await workspace.revealLeaf(leaf);
  }

async createNewGoal(input: CreateGoalInput) {
  const now = formatDateTime();

  const title = input.title.trim();
  if (title.length === 0) {
    new Notice("目标标题不能为空");
    return;
  }

  const newGoal: Goal = {
    id: crypto.randomUUID(),
    title: title,
    description: input.description?.trim()||undefined,
    deadline: input.deadline?.trim()||undefined,
    status: input.status ?? "todo",
    createdAt: now,
    updatedAt: now,
  };
    
  this.data.goals.push(newGoal);
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