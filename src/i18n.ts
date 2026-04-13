import { GoalStatus } from "./types";

export type AppLanguage = "zh-CN" | "en-US";

export type I18nStrings = {
  common: {
    create: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    optional: string;
  };

  goal: {
    form: {
      createGoal: string;
      editGoal: string;
      deleteGoal: string;
      titleLabel: string;
      descriptionLabel: string;
      deadlineLabel: string;
      statusLabel: string;
    };

    board: {
      title: string;
      addGoal: string;
      noGoals: string;
      deleteConfirm: string;
    };

    detail: {
      status: string;
      description: string;
      createdAt: string;
      updatedAt: string;
      deadline: string;
    };

    validation: {
      emptyTitle: string;
      invalidDeadline: string;
      notfoundGoal: string;
      notfoundWorkItem: string;
    };

    statusLabels: Record<GoalStatus, string>;
  };
  workItem: {
    form: {
      createWorkItem: string;
      titleLabel: string;
      descriptionLabel: string;
      deadlineLabel: string;
      statusLabel: string;
    };

    validation: {
      emptyTitle: string;
      invalidDeadline: string;
      notfoundGoal: string;
      notfoundWorkItem: string;
    };

    statusLabels: Record<GoalStatus, string>;
  };
};

export const zhCN: I18nStrings = {
  common: {
    create: "创建",
    edit: "编辑",
    delete: "删除",
    save: "保存",
    cancel: "取消",
    optional: "可选",
  },

  goal: {
    form: {
      createGoal: "创建目标",
      editGoal: "编辑目标",
      deleteGoal: "删除目标",
      titleLabel: "目标标题",
      descriptionLabel: "目标描述",
      deadlineLabel: "截止日期",
      statusLabel: "状态",
    },

    board: {
      title: "目标看板",
      addGoal: "添加目标",
      noGoals: "暂无目标",
      deleteConfirm: "确定要删除这个目标吗？",
    },

    detail: {
      status: "状态",
      description: "描述",
      createdAt: "创建时间",
      updatedAt: "更新时间",
      deadline: "截止日期",
    },

    validation: {
      emptyTitle: "目标标题不能为空",
      invalidDeadline: "截止日期格式应为 YYYY-MM-DD",
      notfoundGoal: "未找到目标",
      notfoundWorkItem: "未找到目标子项",
    },

    statusLabels: {
      todo: "待办",
      in_progress: "进行中",
      paused: "暂停",
      done: "已完成",
    },
  },
  workItem: {
    form: {
      createWorkItem: "创建目标子项",
      titleLabel: "子项标题",
      descriptionLabel: "子项描述",
      deadlineLabel: "截止日期",
      statusLabel: "状态",
    },

    validation: {
      emptyTitle: "目标标题不能为空",
      invalidDeadline: "截止日期格式应为 YYYY-MM-DD",
      notfoundGoal: "未找到目标",
      notfoundWorkItem: "未找到目标子项",
    },

    statusLabels: {
      todo: "待办",
      in_progress: "进行中",
      paused: "暂停",
      done: "已完成",
    },
  },
};

export const enUS: I18nStrings = {
  common: {
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    optional: "Optional",
  },

  goal: {
    form: {
      createGoal: "Create Goal",
      editGoal: "Edit Goal",
      deleteGoal: "Delete Goal",
      titleLabel: "Goal Title",
      descriptionLabel: "Goal Description",
      deadlineLabel: "Deadline",
      statusLabel: "Status",
    },

    board: {
      title: "Goal Board",
      addGoal: "Add Goal",
      noGoals: "No goals yet",
      deleteConfirm: "Are you sure you want to delete this goal?",
    },

    detail: {
      status: "Status",
      description: "Description",
      createdAt: "Created At",
      updatedAt: "Updated At",
      deadline: "Deadline",
    },

    validation: {
      emptyTitle: "Goal title cannot be empty",
      invalidDeadline: "Deadline must be in YYYY-MM-DD format",
      notfoundGoal: "Goal not found",
      notfoundWorkItem: "WorkItem not found",
    },

    statusLabels: {
      todo: "To do",
      in_progress: "In progress",
      paused: "Paused",
      done: "Done",
    },
  },
  workItem: {
    form: {
      createWorkItem: "Create WorkItem",
      titleLabel: "WorkItem Title",
      descriptionLabel: "WorkItem Description",
      deadlineLabel: "Deadline",
      statusLabel: "Status",
    },

    validation: {
      emptyTitle: "Goal title cannot be empty",
      invalidDeadline: "Deadline must be in YYYY-MM-DD format",
      notfoundGoal: "Goal not found",
      notfoundWorkItem: "WorkItem not found",
    },
    
    statusLabels: {
      todo: "To do",
      in_progress: "In progress",
      paused: "Paused",
      done: "Done",
    },
  },
};

const dictionaries: Record<AppLanguage, I18nStrings> = {
  "zh-CN": zhCN,
  "en-US": enUS,
};

export function normalizeLanguageCode(lang: string): AppLanguage {
  if (!lang) {
    return "en-US";
  }

  const lowerLang = lang.toLowerCase();

  if (lowerLang.startsWith("zh")) return "zh-CN";
  if (lowerLang.startsWith("en")) return "en-US";

  return "en-US";
}

export function getCurrentLanguage(explicitLang?: string): AppLanguage {
  if (explicitLang) return normalizeLanguageCode(explicitLang);

  if (typeof navigator !== "undefined" && navigator.language) {
    return normalizeLanguageCode(navigator.language);
  }

  return "en-US";
}

export function getI18nStrings(lang?: string): I18nStrings {
  const currentLang = getCurrentLanguage(lang);
  return dictionaries[currentLang];
}
