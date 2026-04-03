export const DEFAULT_DATA: GoalPluginData = {
  goals: [
    {
      id: "1",
      title: "示例目标",
      createdAt: new Date().toISOString(),
      deadline: "2026-05-01",
      status: "todo",
      // description: "这是一个示例目标",
      // stepIds: ["1", "2"],
    },
    {
      id: "2",
      title: "另一个目标",
      createdAt: "2026-04-03",
      status: "in_progress",
      // description: "这是另一个示例目标",
      // stepIds: ["3"], 
    }
  ],
  steps: [],
};
export const VIEW_TYPE_GOAL_BOARD = "goal-board-view";
