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

export type CreateGoalInput = {
  title: string;
  description?: string;
  deadline?: string; 
  status?: GoalStatus;
}

export type UpdateGoalInput = Partial<
  Pick<Goal, "title" | "description" | "status" | "deadline">
>;

export interface GoalPluginData {
  goals: Goal[];
  workItems: WorkItem[];
}


