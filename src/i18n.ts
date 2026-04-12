import { GoalStatus } from "./types";

export type AppLanguage = "zh-CN" | "en-US";

export type I18nStrings = {
  common: {
    create: string;
    edit: string;
    save: string;
    cancel: string;
    optional: string;
  };

  goal: {
    form: {
      createGoal: string;
      editGoal: string;
      titleLabel: string;
      descriptionLabel: string;
      deadlineLabel: string;
      statusLabel: string;
    };

    board: {
      title: string;
      addGoal: string;
      noGoals: string;
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
    };

    statusLabels: Record<GoalStatus, string>;
  };
};

export const zhCN: I18nStrings = {
  common: {
    create: "创建",
    edit: "编辑",
    save: "保存",
    cancel: "取消",
    optional: "可选",
  },

  goal: {
    form: {
      createGoal: "创建目标",
      editGoal: "编辑目标",
      titleLabel: "目标标题",
      descriptionLabel: "目标描述",
      deadlineLabel: "截止日期",
      statusLabel: "状态",
    },

    board: {
      title: "目标看板",
      addGoal: "添加目标",
      noGoals: "暂无目标",
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
    save: "Save",
    cancel: "Cancel",
    optional: "Optional",
  },

  goal: {
    form: {
      createGoal: "Create Goal",
      editGoal: "Edit Goal",
      titleLabel: "Goal Title",
      descriptionLabel: "Goal Description",
      deadlineLabel: "Deadline",
      statusLabel: "Status",
    },

    board: {
      title: "Goal Board",
      addGoal: "Add Goal",
      noGoals: "No goals yet",
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
