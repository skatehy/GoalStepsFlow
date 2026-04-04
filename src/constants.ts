export const DEFAULT_DATA: GoalPluginData = {
  goals: [
    {
      id: "goal-1",
      title: "Example Goal",
      description: "This is an example goal.",
      status: "todo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "goal-2",
      title: "Another Goal",
      description: "This is another example goal.",
      status: "in_progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    }
  ],
  workItems: [],
};
export const VIEW_TYPE_GOAL_BOARD = "goal-board-view";
