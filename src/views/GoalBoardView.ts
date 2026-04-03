import { ItemView, WorkspaceLeaf } from "obsidian";
import GoalTimelinePlugin from "../main";

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
    this.contentEl.empty();
    this.contentEl.createEl("h2", { text: "Goal Board" });
    this.contentEl.createEl("p", { text: "这里以后显示目标卡片" });
  }

  async onClose() {
    this.contentEl.empty();
  }
}