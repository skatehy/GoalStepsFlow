export type GoalStatus = "todo" | "in_progress" | "done" | "paused";

export type Goal = {
  id: string;
  title: string;
  description?: string;


  status: GoalStatus;

  createdAt: string;
  updatedAt: string;
  deadline?: string;
};

export type WorkItem = {
  id: string;
  goalId: string;
  parentId:string | null;
  
  title: string;
  description?: string;

  status: GoalStatus;
  layerHint: "goal" | "week" | "day";

  createdAt: string;
  updatedAt: string;
  deadline?: string;
}

export interface GoalPluginData {
  goals: Goal[];
  workItems: WorkItem[];
}

