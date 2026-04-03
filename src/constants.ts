import type { TimeflowSettings } from "./types";

export const VIEW_TYPE_TIMEFLOW = "timeflow-view";

export const DEFAULT_SETTINGS: TimeflowSettings = {
  dayStartHour: 6,
  dayEndHour: 23,
  defaultDuration: 30,
};
