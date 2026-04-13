import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { DeleteGoalModal } from "../modals/DeleteGoalModal";
import { DeleteWorkItemModal } from "../modals/DeleteWorkItemModal";
import { getCurrentLanguage, getI18nStrings } from "../i18n";
import GoalTimelinePlugin from "../main";
import { CreateGoalInput, Goal, GoalStatus, UpdateGoalInput, UpdateWorkItemInput, WorkItem } from "../types";

export const VIEW_TYPE_GOAL_BOARD = "goal-board-view";

export class GoalBoardView extends ItemView {
  plugin: GoalTimelinePlugin;
  private expandedGoalIds = new Set<string>();
  private draftGoalStatus: GoalStatus | null = null;
  private draftWorkItemGoalId: string | null = null;
  private newGoalTitleDraft = "";
  private newGoalDescriptionDraft = "";
  private newGoalDeadlineDraft = "";
  private newGoalStatusDraft: GoalStatus = "todo";
  private newWorkItemTitleDraft = "";
  private newWorkItemDescriptionDraft = "";
  private newWorkItemDeadlineDraft = "";
  private newWorkItemStatusDraft: GoalStatus = "todo";

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
    this.render();
  }

  async onClose() {
    this.contentEl.empty();
  }

  private isValidDateString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  private parseDateOnly(value?: string): Date | null {
    if (!value || !this.isValidDateString(value)) {
      return null;
    }

    const parts = value.split("-").map(Number);
    if (parts.length !== 3) {
      return null;
    }

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    if (year === undefined || month === undefined || day === undefined) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  private parseDateTimeValue(value?: string): Date | null {
    if (!value) {
      return null;
    }

    const match = value.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{2}):(\d{2})$/);
    if (!match) {
      return null;
    }

    const [, year, month, day, hour, minute] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private diffInDays(later: Date, earlier: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.round((this.startOfDay(later).getTime() - this.startOfDay(earlier).getTime()) / millisecondsPerDay);
  }

  private getGoalDeadlineDisplay(goal: Goal): { shortText: string; fullText: string } | null {
    if (!goal.deadline) {
      return null;
    }

    const deadlineDate = this.parseDateOnly(goal.deadline);
    if (!deadlineDate) {
      return null;
    }

    const createdDate = this.parseDateTimeValue(goal.createdAt);
    const today = new Date();
    const daysUntilDeadline = this.diffInDays(deadlineDate, today);
    const daysSinceCreated = createdDate ? this.diffInDays(today, createdDate) : null;
    const language = getCurrentLanguage();

    if (language === "zh-CN") {
      const shortText =
        daysUntilDeadline > 0
          ? `还剩 ${daysUntilDeadline} 天`
          : daysUntilDeadline === 0
            ? "今天截止"
            : `已逾期 ${Math.abs(daysUntilDeadline)} 天`;

      const elapsedText =
        daysSinceCreated === null
          ? ""
          : `创建后已过去 ${daysSinceCreated} 天`;

      const remainingText =
        daysUntilDeadline > 0
          ? `距离截止还有 ${daysUntilDeadline} 天`
          : daysUntilDeadline === 0
            ? "今天就是截止日"
            : `已经逾期 ${Math.abs(daysUntilDeadline)} 天`;

      const fullText = [`截止日期：${goal.deadline}`, elapsedText, remainingText].filter(Boolean).join(" · ");
      return { shortText, fullText };
    }

    const shortText =
      daysUntilDeadline > 0
        ? `${daysUntilDeadline} days left`
        : daysUntilDeadline === 0
          ? "Due today"
          : `${Math.abs(daysUntilDeadline)} days overdue`;

    const elapsedText =
      daysSinceCreated === null
        ? ""
        : `${daysSinceCreated} days since creation`;

    const remainingText =
      daysUntilDeadline > 0
        ? `${daysUntilDeadline} days remaining until deadline`
        : daysUntilDeadline === 0
          ? "Deadline is today"
          : `${Math.abs(daysUntilDeadline)} days overdue`;

    const fullText = [`Deadline: ${goal.deadline}`, elapsedText, remainingText].filter(Boolean).join(" · ");
    return { shortText, fullText };
  }

  private createEditableTextDisplay(
    tag: "h3" | "p",
    parent: HTMLElement,
    displayText: string,
    onClick: (targetEl: HTMLElement) => void,
    extraClass?: string
  ) {
    const el = parent.createEl(tag, { text: displayText, cls: "inline-edit-display" });
    if (extraClass) {
      el.addClass(extraClass);
    }
    el.setAttribute("tabindex", "0");
    el.addEventListener("click", () => onClick(el));
    el.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        onClick(el);
      }
    });
    return el;
  }

  private createEditableStatusBadge(
    parent: HTMLElement,
    status: GoalStatus,
    label: string,
    onClick: () => void
  ) {
    const badgeEl = parent.createEl("button", {
      cls: `goal-status-badge goal-status-badge--${status}`,
      text: label,
    });
    badgeEl.type = "button";
    badgeEl.addEventListener("click", onClick);
    return badgeEl;
  }

  private createGoalStatusBadge(
    parent: HTMLElement,
    goal: Goal,
    t: ReturnType<typeof getI18nStrings>
  ) {
    const badgeEl = this.createEditableStatusBadge(
      parent,
      goal.status,
      t.goal.statusLabels[goal.status],
      () => {
        this.startInlineStatusEdit(badgeEl, goal, t);
      }
    );
    badgeEl.setAttribute("aria-label", `${t.goal.detail.status}: ${t.goal.statusLabels[goal.status]}`);
    return badgeEl;
  }

  private startInlineTextEdit(
    targetEl: HTMLElement,
    currentValue: string,
    onSave: (value: string) => Promise<void>,
    options?: {
      multiline?: boolean;
      placeholder?: string;
      requireNonEmpty?: boolean;
      validateDate?: boolean;
      emptyValue?: string;
    }
  ) {
    const t = getI18nStrings();
    const parent = targetEl.parentElement;
    if (!parent) {
      return;
    }

    const editor = options?.multiline ? document.createElement("textarea") : document.createElement("input");
    if (!options?.multiline) {
      (editor as HTMLInputElement).type = "text";
    }

    editor.className = "inline-edit-input";
    if (options?.multiline) {
      editor.classList.add("inline-edit-textarea");
      (editor as HTMLTextAreaElement).rows = 3;
    }

    editor.value = currentValue;
    editor.placeholder = options?.placeholder ?? "";
    targetEl.replaceWith(editor);
    editor.focus();
    editor.select();

    let finished = false;

    const finish = async (save: boolean) => {
      if (finished) {
        return;
      }
      finished = true;

      const nextValue = editor.value.trim();
      if (!save) {
        this.render();
        return;
      }

      if (options?.requireNonEmpty && nextValue.length === 0) {
        new Notice(t.goal.validation.emptyTitle);
        finished = false;
        editor.focus();
        return;
      }

      if (options?.validateDate && nextValue.length > 0 && !this.isValidDateString(nextValue)) {
        new Notice(t.goal.validation.invalidDeadline);
        finished = false;
        editor.focus();
        return;
      }

      const normalizedCurrent = currentValue.trim();
      if (nextValue === normalizedCurrent) {
        this.render();
        return;
      }

      const valueToSave = nextValue || options?.emptyValue || "";
      await onSave(valueToSave);
    };

    editor.addEventListener("blur", () => {
      void finish(true);
    });

    editor.addEventListener("keydown", (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        evt.preventDefault();
        void finish(false);
        return;
      }

      if (!options?.multiline && evt.key === "Enter") {
        evt.preventDefault();
        void finish(true);
      }

      if (options?.multiline && (evt.ctrlKey || evt.metaKey) && evt.key === "Enter") {
        evt.preventDefault();
        void finish(true);
      }
    });
  }

  private startInlineStatusEdit(
    targetEl: HTMLElement,
    goal: Goal,
    t: ReturnType<typeof getI18nStrings>
  ) {
    const parent = targetEl.parentElement;
    if (!parent) {
      return;
    }

    const selectEl = document.createElement("select");
    selectEl.className = "inline-edit-input inline-edit-select";

    (Object.keys(t.goal.statusLabels) as GoalStatus[]).forEach((status) => {
      const optionEl = document.createElement("option");
      optionEl.value = status;
      optionEl.textContent = t.goal.statusLabels[status];
      if (status === goal.status) {
        optionEl.selected = true;
      }
      selectEl.appendChild(optionEl);
    });

    targetEl.replaceWith(selectEl);
    selectEl.focus();

    let finished = false;

    const finish = async (save: boolean) => {
      if (finished) {
        return;
      }
      finished = true;

      if (!save || selectEl.value === goal.status) {
        this.render();
        return;
      }

      await this.plugin.updateGoal(goal.id, {
        status: selectEl.value as GoalStatus,
      });
    };

    selectEl.addEventListener("change", () => {
      void finish(true);
    });

    selectEl.addEventListener("blur", () => {
      void finish(true);
    });

    selectEl.addEventListener("keydown", (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        evt.preventDefault();
        void finish(false);
      }
      if (evt.key === "Enter") {
        evt.preventDefault();
        void finish(true);
      }
    });
  }

  private saveGoalField(goalId: string, patch: UpdateGoalInput) {
    return this.plugin.updateGoal(goalId, patch);
  }

  private saveWorkItemField(workItemId: string, patch: UpdateWorkItemInput) {
    return this.plugin.updateWorkItem(workItemId, patch);
  }

  private renderMissingGoalFields(cardEl: HTMLElement, goal: Goal, t: ReturnType<typeof getI18nStrings>) {
    const missingFields: Array<{
      key: "description" | "deadline";
      label: string;
      multiline?: boolean;
      validateDate?: boolean;
      placeholder: string;
    }> = [];

    if (!goal.description) {
      missingFields.push({
        key: "description",
        label: t.goal.form.descriptionLabel,
        multiline: true,
        placeholder: t.goal.form.descriptionLabel,
      });
    }

    if (!goal.deadline) {
      missingFields.push({
        key: "deadline",
        label: t.goal.form.deadlineLabel,
        validateDate: true,
        placeholder: "YYYY-MM-DD",
      });
    }

    if (missingFields.length === 0) {
      return;
    }

    const rowEl = cardEl.createDiv({ cls: "goal-card-empty-fields" });

    for (const field of missingFields) {
      const addBtn = rowEl.createEl("button", {
        cls: "goal-card-empty-field-button",
        text: `+ ${field.label}`,
      });

      addBtn.addEventListener("click", () => {
        this.startInlineTextEdit(
          addBtn,
          "",
          async (value) => {
            if (field.key === "description") {
              await this.saveGoalField(goal.id, { description: value || undefined });
              return;
            }

            await this.saveGoalField(goal.id, { deadline: value || undefined });
          },
          {
            multiline: field.multiline,
            validateDate: field.validateDate,
            placeholder: field.placeholder,
          }
        );
      });
    }
  }

  private startInlineWorkItemStatusEdit(
    targetEl: HTMLElement,
    workItem: WorkItem,
    t: ReturnType<typeof getI18nStrings>
  ) {
    const parent = targetEl.parentElement;
    if (!parent) {
      return;
    }

    const selectEl = document.createElement("select");
    selectEl.className = "inline-edit-input inline-edit-select";

    (Object.keys(t.workItem.statusLabels) as GoalStatus[]).forEach((status) => {
      const optionEl = document.createElement("option");
      optionEl.value = status;
      optionEl.textContent = t.workItem.statusLabels[status];
      if (status === workItem.status) {
        optionEl.selected = true;
      }
      selectEl.appendChild(optionEl);
    });

    targetEl.replaceWith(selectEl);
    selectEl.focus();

    let finished = false;

    const finish = async (save: boolean) => {
      if (finished) {
        return;
      }
      finished = true;

      if (!save || selectEl.value === workItem.status) {
        this.render();
        return;
      }

      await this.plugin.updateWorkItem(workItem.id, {
        status: selectEl.value as GoalStatus,
      });
    };

    selectEl.addEventListener("change", () => {
      void finish(true);
    });

    selectEl.addEventListener("blur", () => {
      void finish(true);
    });

    selectEl.addEventListener("keydown", (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        evt.preventDefault();
        void finish(false);
      }
      if (evt.key === "Enter") {
        evt.preventDefault();
        void finish(true);
      }
    });
  }

  private renderMissingWorkItemFields(
    itemEl: HTMLElement,
    workItem: WorkItem,
    t: ReturnType<typeof getI18nStrings>
  ) {
    const missingFields: Array<{
      key: "description" | "deadline";
      label: string;
      multiline?: boolean;
      validateDate?: boolean;
      placeholder: string;
    }> = [];

    if (!workItem.description) {
      missingFields.push({
        key: "description",
        label: t.workItem.form.descriptionLabel,
        multiline: true,
        placeholder: t.workItem.form.descriptionLabel,
      });
    }

    if (!workItem.deadline) {
      missingFields.push({
        key: "deadline",
        label: t.workItem.form.deadlineLabel,
        validateDate: true,
        placeholder: "YYYY-MM-DD",
      });
    }

    if (missingFields.length === 0) {
      return;
    }

    const rowEl = itemEl.createDiv({ cls: "workitem-empty-fields goal-card-empty-fields" });

    for (const field of missingFields) {
      const addBtn = rowEl.createEl("button", {
        cls: "goal-card-empty-field-button",
        text: `+ ${field.label}`,
      });

      addBtn.addEventListener("click", () => {
        this.startInlineTextEdit(
          addBtn,
          "",
          async (value) => {
            if (field.key === "description") {
              await this.saveWorkItemField(workItem.id, { description: value || undefined });
              return;
            }

            await this.saveWorkItemField(workItem.id, { deadline: value || undefined });
          },
          {
            multiline: field.multiline,
            validateDate: field.validateDate,
            placeholder: field.placeholder,
          }
        );
      });
    }
  }

  render() {
    const t = getI18nStrings();
    const goals = this.plugin.data.goals as Goal[];
    const todoGoals = goals.filter((goal) => goal.status === "todo");
    const inProgressGoals = goals.filter((goal) => goal.status === "in_progress");
    const pausedGoals = goals.filter((goal) => goal.status === "paused");
    const doneGoals = goals.filter((goal) => goal.status === "done");

    this.contentEl.empty();

    const boardEl = this.contentEl.createDiv({ cls: "goal-board-view" });

    boardEl.createEl("h2", { text: t.goal.board.title });

    const sectionsEl = boardEl.createDiv({ cls: "goal-board-sections" });

    this.renderStatusSection(sectionsEl, t.goal.statusLabels.todo, "goal-board-section--todo", "todo", todoGoals, t);
    this.renderStatusSection(
      sectionsEl,
      t.goal.statusLabels.in_progress,
      "goal-board-section--in-progress",
      "in_progress",
      inProgressGoals,
      t
    );
    this.renderStatusSection(sectionsEl, t.goal.statusLabels.paused, "goal-board-section--paused", "paused", pausedGoals, t);
    this.renderStatusSection(sectionsEl, t.goal.statusLabels.done, "goal-board-section--done", "done", doneGoals, t);
  }

  private resetDraftGoal() {
    this.draftGoalStatus = null;
    this.newGoalTitleDraft = "";
    this.newGoalDescriptionDraft = "";
    this.newGoalDeadlineDraft = "";
    this.newGoalStatusDraft = "todo";
  }

  private renderDraftGoalCard(
    container: HTMLElement,
    sectionStatus: GoalStatus,
    t: ReturnType<typeof getI18nStrings>
  ) {
    const draftCardEl = container.createDiv({ cls: "goal-card draft-goal-card" });
    const titleInputEl = draftCardEl.createEl("input", {
      cls: "inline-edit-input inline-goal-creator-input",
      attr: {
        type: "text",
        placeholder: t.goal.form.titleLabel,
      },
    });
    titleInputEl.value = this.newGoalTitleDraft;

    const statusRowEl = draftCardEl.createDiv({ cls: "goal-card-status-row" });
    const statusBadgeEl = this.createEditableStatusBadge(
      statusRowEl,
      sectionStatus,
      t.goal.statusLabels[sectionStatus],
      () => void 0
    );
    statusBadgeEl.disabled = true;
    statusBadgeEl.classList.add("goal-status-badge--static");

    const descriptionInputEl = draftCardEl.createEl("textarea", {
      cls: "inline-edit-input inline-edit-textarea inline-goal-creator-description",
      attr: {
        placeholder: t.goal.form.descriptionLabel,
      },
    });
    descriptionInputEl.rows = 3;
    descriptionInputEl.value = this.newGoalDescriptionDraft;

    const footerEl = draftCardEl.createDiv({ cls: "inline-goal-creator-footer" });

    const deadlineInputEl = footerEl.createEl("input", {
      cls: "inline-edit-input inline-goal-creator-deadline",
      attr: {
        type: "text",
        placeholder: "YYYY-MM-DD",
      },
    });
    deadlineInputEl.value = this.newGoalDeadlineDraft;

    const createBtn = footerEl.createEl("button", {
      cls: "workitem-create-button",
      text: `+ ${t.common.create}`,
    });

    const cancelBtn = footerEl.createEl("button", {
      text: t.common.cancel,
    });

    window.setTimeout(() => {
      titleInputEl.focus();
      titleInputEl.select();
    }, 0);

    const submitDraftGoal = async () => {
      const title = titleInputEl.value.trim();
      const description = descriptionInputEl.value.trim();
      const deadline = deadlineInputEl.value.trim();

      this.newGoalTitleDraft = title;
      this.newGoalDescriptionDraft = description;
      this.newGoalDeadlineDraft = deadline;
      this.newGoalStatusDraft = sectionStatus;

      if (!title) {
        new Notice(t.goal.validation.emptyTitle);
        titleInputEl.focus();
        return;
      }

      if (deadline && !this.isValidDateString(deadline)) {
        new Notice(t.goal.validation.invalidDeadline);
        deadlineInputEl.focus();
        return;
      }

      await this.plugin.createNewGoal({
        title,
        description: description || undefined,
        deadline: deadline || undefined,
        status: sectionStatus,
      });

      this.resetDraftGoal();
      this.render();
    };

    titleInputEl.addEventListener("input", () => {
      this.newGoalTitleDraft = titleInputEl.value;
    });

    descriptionInputEl.addEventListener("input", () => {
      this.newGoalDescriptionDraft = descriptionInputEl.value;
    });

    deadlineInputEl.addEventListener("input", () => {
      this.newGoalDeadlineDraft = deadlineInputEl.value;
    });

    titleInputEl.addEventListener("keydown", (evt: KeyboardEvent) => {
      if (evt.key === "Enter") {
        evt.preventDefault();
        void submitDraftGoal();
      }

      if (evt.key === "Escape") {
        evt.preventDefault();
        this.resetDraftGoal();
        this.render();
      }
    });

    createBtn.addEventListener("click", () => {
      void submitDraftGoal();
    });

    cancelBtn.addEventListener("click", () => {
      this.resetDraftGoal();
      this.render();
    });
  }

  private renderEmptySectionState(container: HTMLElement, t: ReturnType<typeof getI18nStrings>) {
    const emptyEl = container.createDiv({ cls: "goal-empty-section-state" });
    emptyEl.createEl("p", { text: t.goal.board.noGoals });
  }

  private resetDraftWorkItem() {
    this.draftWorkItemGoalId = null;
    this.newWorkItemTitleDraft = "";
    this.newWorkItemDescriptionDraft = "";
    this.newWorkItemDeadlineDraft = "";
    this.newWorkItemStatusDraft = "todo";
  }

  private renderDraftWorkItemCard(
    container: HTMLElement,
    goal: Goal,
    t: ReturnType<typeof getI18nStrings>
  ) {
    const draftCardEl = container.createDiv({ cls: "workitem-card goal-card draft-goal-card" });
    const titleInputEl = draftCardEl.createEl("input", {
      cls: "inline-edit-input inline-goal-creator-input",
      attr: {
        type: "text",
        placeholder: t.workItem.form.titleLabel,
      },
    });
    titleInputEl.value = this.newWorkItemTitleDraft;

    const statusRowEl = draftCardEl.createDiv({ cls: "goal-card-status-row" });
    const statusSelectEl = draftCardEl.createEl("select", {
      cls: "inline-edit-input inline-edit-select inline-goal-creator-select",
    });
    (Object.keys(t.workItem.statusLabels) as GoalStatus[]).forEach((status) => {
      const optionEl = statusSelectEl.createEl("option", {
        text: t.workItem.statusLabels[status],
        value: status,
      });
      optionEl.selected = status === this.newWorkItemStatusDraft;
    });

    const descriptionInputEl = draftCardEl.createEl("textarea", {
      cls: "inline-edit-input inline-edit-textarea inline-goal-creator-description",
      attr: {
        placeholder: t.workItem.form.descriptionLabel,
      },
    });
    descriptionInputEl.rows = 3;
    descriptionInputEl.value = this.newWorkItemDescriptionDraft;

    const footerEl = draftCardEl.createDiv({ cls: "inline-goal-creator-footer" });
    const deadlineInputEl = footerEl.createEl("input", {
      cls: "inline-edit-input inline-goal-creator-deadline",
      attr: {
        type: "text",
        placeholder: "YYYY-MM-DD",
      },
    });
    deadlineInputEl.value = this.newWorkItemDeadlineDraft;

    const createBtn = footerEl.createEl("button", {
      cls: "workitem-create-button",
      text: `+ ${t.common.create}`,
    });

    const cancelBtn = footerEl.createEl("button", {
      text: t.common.cancel,
    });

    window.setTimeout(() => {
      titleInputEl.focus();
      titleInputEl.select();
    }, 0);

    const submitDraftWorkItem = async () => {
      const title = titleInputEl.value.trim();
      const description = descriptionInputEl.value.trim();
      const deadline = deadlineInputEl.value.trim();

      this.newWorkItemTitleDraft = title;
      this.newWorkItemDescriptionDraft = description;
      this.newWorkItemDeadlineDraft = deadline;
      this.newWorkItemStatusDraft = statusSelectEl.value as GoalStatus;

      if (!title) {
        new Notice(t.workItem.validation.emptyTitle);
        titleInputEl.focus();
        return;
      }

      if (deadline && !this.isValidDateString(deadline)) {
        new Notice(t.workItem.validation.invalidDeadline);
        deadlineInputEl.focus();
        return;
      }

      await this.plugin.createWorkItem({
        goalId: goal.id,
        title,
        description: description || undefined,
        deadline: deadline || undefined,
        status: statusSelectEl.value as GoalStatus,
      });

      this.resetDraftWorkItem();
      this.expandedGoalIds.add(goal.id);
      this.render();
    };

    titleInputEl.addEventListener("input", () => {
      this.newWorkItemTitleDraft = titleInputEl.value;
    });

    descriptionInputEl.addEventListener("input", () => {
      this.newWorkItemDescriptionDraft = descriptionInputEl.value;
    });

    deadlineInputEl.addEventListener("input", () => {
      this.newWorkItemDeadlineDraft = deadlineInputEl.value;
    });

    statusSelectEl.addEventListener("change", () => {
      this.newWorkItemStatusDraft = statusSelectEl.value as GoalStatus;
    });

    titleInputEl.addEventListener("keydown", (evt: KeyboardEvent) => {
      if (evt.key === "Enter") {
        evt.preventDefault();
        void submitDraftWorkItem();
      }

      if (evt.key === "Escape") {
        evt.preventDefault();
        this.resetDraftWorkItem();
        this.render();
      }
    });

    createBtn.addEventListener("click", () => {
      void submitDraftWorkItem();
    });

    cancelBtn.addEventListener("click", () => {
      this.resetDraftWorkItem();
      this.render();
    });
  }

  private renderSectionHeader(
    sectionEl: HTMLElement,
    sectionTitle: string,
    sectionStatus: GoalStatus,
    t: ReturnType<typeof getI18nStrings>
  ) {
    const headerEl = sectionEl.createDiv({ cls: "goal-board-section-header" });
    headerEl.createEl("h3", { text: sectionTitle });

    const addBtn = headerEl.createEl("button", {
      cls: "workitem-create-button section-add-button",
      text: "+",
    });
    addBtn.type = "button";
    addBtn.setAttribute("aria-label", `Add goal in ${sectionTitle}`);
    addBtn.addEventListener("click", () => {
      this.draftGoalStatus = sectionStatus;
      this.newGoalStatusDraft = sectionStatus;
      this.render();
    });
  }

  private renderStatusSection(
    container: HTMLElement,
    sectionTitle: string,
    sectionClass: string,
    sectionStatus: GoalStatus,
    goals: Goal[],
    t: ReturnType<typeof getI18nStrings>
  ) {
    const sectionEl = container.createDiv({ cls: "goal-board-section" });
    sectionEl.addClass(sectionClass);
    this.renderSectionHeader(sectionEl, sectionTitle, sectionStatus, t);

    const listEl = sectionEl.createDiv({ cls: "goal-board-list" });

    if (this.draftGoalStatus === sectionStatus) {
      this.renderDraftGoalCard(listEl, sectionStatus, t);
    }

    if (goals.length === 0 && this.draftGoalStatus !== sectionStatus) {
      this.renderEmptySectionState(listEl, t);
      return;
    }

    for (const goal of goals) {
      this.renderGoalCard(listEl, goal, t);
    }
  }

  private renderGoalCard(container: HTMLElement, goal: Goal, t: ReturnType<typeof getI18nStrings>) {
    const cardEl = container.createDiv({ cls: "goal-card" });
    this.createEditableTextDisplay("h3", cardEl, goal.title, (targetEl) => {
      this.startInlineTextEdit(targetEl, goal.title, async (value) => {
        await this.saveGoalField(goal.id, { title: value });
      }, {
        placeholder: t.goal.form.titleLabel,
        requireNonEmpty: true,
      });
    }, "goal-card-title");

    const statusRowEl = cardEl.createDiv({ cls: "goal-card-status-row" });
    this.createGoalStatusBadge(statusRowEl, goal, t);

    if (goal.description) {
      this.createEditableTextDisplay(
        "p",
        cardEl,
        `${t.goal.detail.description}: ${goal.description}`,
        (targetEl) => {
          this.startInlineTextEdit(
            targetEl,
            goal.description ?? "",
            async (value) => {
              await this.saveGoalField(goal.id, { description: value || undefined });
            },
            {
              multiline: true,
              placeholder: t.goal.form.descriptionLabel,
            }
          );
        }
      );
    }

    if (goal.deadline) {
      const deadlineDisplay = this.getGoalDeadlineDisplay(goal);
      const deadlineEl = this.createEditableTextDisplay(
        "p",
        cardEl,
        deadlineDisplay ? deadlineDisplay.shortText : `${t.goal.detail.deadline}: ${goal.deadline}`,
        (targetEl) => {
          this.startInlineTextEdit(
            targetEl,
            goal.deadline ?? "",
            async (value) => {
              await this.saveGoalField(goal.id, { deadline: value || undefined });
            },
            {
              placeholder: "YYYY-MM-DD",
              validateDate: true,
            }
          );
        }
      );
      if (deadlineDisplay) {
        deadlineEl.addClass("goal-card-deadline-summary");
        deadlineEl.setAttribute("title", deadlineDisplay.fullText);
        deadlineEl.setAttribute("aria-label", deadlineDisplay.fullText);
      }
    }

    const metaEl = cardEl.createDiv({ cls: "goal-card-meta" });
    metaEl.createEl("span", {
      text: `${t.goal.detail.createdAt}: ${goal.createdAt}`,
    });
    metaEl.createEl("span", {
      text: `${t.goal.detail.updatedAt}: ${goal.updatedAt}`,
    });

    this.renderMissingGoalFields(cardEl, goal, t);

    const actionsEl = cardEl.createDiv({ cls: "goal-card-actions" });

    const deleteBtn = actionsEl.createEl("button", {
      cls: "goal-card-delete-button",
      text: t.common.delete,
    });

    deleteBtn.addEventListener("click", () => {
      new DeleteGoalModal(this.app, goal, async () => {
        await this.plugin.deleteGoal(goal.id);
      }).open();
    });

    const createWorkItemBtn = actionsEl.createEl("button", {
      cls: "workitem-create-button",
      text: `+ WorkItem`,
    });

    createWorkItemBtn.addEventListener("click", () => {
      this.draftWorkItemGoalId = goal.id;
      this.newWorkItemStatusDraft = "todo";
      this.expandedGoalIds.add(goal.id);
      this.render();
    });

    this.renderWorkItemSection(cardEl, goal, t);
  }

  private renderWorkItemSection(cardEl: HTMLElement, goal: Goal, t: ReturnType<typeof getI18nStrings>) {
    const workItems = this.plugin.getWorkItemsByGoalId(goal.id);
    const isExpanded = this.expandedGoalIds.has(goal.id) || workItems.length > 0;

    if (workItems.length === 0 && this.draftWorkItemGoalId !== goal.id) {
      return;
    }

    const sectionEl = cardEl.createDiv({ cls: "goal-workitem-section" });
    const headerEl = sectionEl.createDiv({ cls: "goal-workitem-header" });

    headerEl.createEl("h4", {
      text: `${t.workItem.board.sectionTitle} (${workItems.length})`,
    });

    const toggleBtn = headerEl.createEl("button", {
      cls: "goal-workitem-toggle-button",
      text: isExpanded ? t.common.collapse : t.common.expand,
    });

    toggleBtn.addEventListener("click", () => {
      if (this.expandedGoalIds.has(goal.id)) {
        this.expandedGoalIds.delete(goal.id);
      } else {
        this.expandedGoalIds.add(goal.id);
      }
      this.render();
    });

    if (!isExpanded) {
      return;
    }

    const listEl = sectionEl.createDiv({ cls: "goal-workitem-list" });
    if (this.draftWorkItemGoalId === goal.id) {
      this.renderDraftWorkItemCard(listEl, goal, t);
    }

    if (workItems.length === 0 && this.draftWorkItemGoalId !== goal.id) {
      listEl.createEl("p", { text: t.workItem.board.noWorkItem });
      return;
    }

    for (const workItem of workItems) {
      this.renderWorkItemCard(listEl, workItem, t);
    }
  }

  private renderWorkItemCard(
    container: HTMLElement,
    workItem: WorkItem,
    t: ReturnType<typeof getI18nStrings>
  ) {
    const itemEl = container.createDiv({ cls: "workitem-card goal-card" });

    this.createEditableTextDisplay("h3", itemEl, workItem.title, (targetEl) => {
      this.startInlineTextEdit(
        targetEl,
        workItem.title,
        async (value) => {
          await this.saveWorkItemField(workItem.id, { title: value });
        },
        {
          placeholder: t.workItem.form.titleLabel,
          requireNonEmpty: true,
        }
      );
    }, "goal-card-title");

    const statusRowEl = itemEl.createDiv({ cls: "goal-card-status-row" });
    const badgeEl = this.createEditableStatusBadge(
      statusRowEl,
      workItem.status,
      t.workItem.statusLabels[workItem.status],
      () => {
        this.startInlineWorkItemStatusEdit(badgeEl, workItem, t);
      }
    );
    badgeEl.setAttribute("aria-label", `${t.workItem.form.statusLabel}: ${t.workItem.statusLabels[workItem.status]}`);

    if (workItem.description) {
      this.createEditableTextDisplay(
        "p",
        itemEl,
        `${t.workItem.form.descriptionLabel}: ${workItem.description}`,
        (targetEl) => {
          this.startInlineTextEdit(
            targetEl,
            workItem.description ?? "",
            async (value) => {
              await this.saveWorkItemField(workItem.id, { description: value || undefined });
            },
            {
              multiline: true,
              placeholder: t.workItem.form.descriptionLabel,
            }
          );
        }
      );
    }

    if (workItem.deadline) {
      this.createEditableTextDisplay(
        "p",
        itemEl,
        `${t.workItem.form.deadlineLabel}: ${workItem.deadline}`,
        (targetEl) => {
          this.startInlineTextEdit(
            targetEl,
            workItem.deadline ?? "",
            async (value) => {
              await this.saveWorkItemField(workItem.id, { deadline: value || undefined });
            },
            {
              placeholder: "YYYY-MM-DD",
              validateDate: true,
            }
          );
        }
      );
    }

    const metaEl = itemEl.createDiv({ cls: "goal-card-meta" });
    metaEl.createEl("span", {
      text: `${t.goal.detail.createdAt}: ${workItem.createdAt}`,
    });
    metaEl.createEl("span", {
      text: `${t.goal.detail.updatedAt}: ${workItem.updatedAt}`,
    });

    this.renderMissingWorkItemFields(itemEl, workItem, t);

    const actionsEl = itemEl.createDiv({ cls: "workitem-card-actions goal-card-actions" });

    const deleteWorkItemBtn = actionsEl.createEl("button", {
      cls: "goal-card-delete-button",
      text: t.common.delete,
    });

    deleteWorkItemBtn.addEventListener("click", () => {
      new DeleteWorkItemModal(this.app, workItem, async () => {
        await this.plugin.deleteWorkItem(workItem.id);
      }).open();
    });
  }
}
