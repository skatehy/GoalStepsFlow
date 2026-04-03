type Goal = {
  id: string;
  title: string;
  createdAt: string;
  deadline?: string;
  status: "todo" | "in_progress" | "done" ;
  // description?: string;
  // stepIds: string[];
};

type Step = {
  id: string;
  goalId: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  // priority?: number;
  // estimatedEffort?: number;
  // dependsOn?: string[];
};

type CyclePlan = {
  id: string;
  name: string;
  startDate: string;
  durationDays: number;
  assignments: {
    date: string;
    stepIds: string[];
  }[];
};

type TimelineItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  linkedGoalId?: string;
  linkedStepId?: string;
  status: "todo" | "done";
};

interface GoalPluginData {
  goals: unknown[];
  steps: unknown[];
}

export type { Goal, Step, CyclePlan, TimelineItem, GoalPluginData };