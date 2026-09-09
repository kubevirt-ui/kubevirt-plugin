import { eventMonitor } from './telemetry';
import {
  FEATURE_DEPTH_MEASURED,
  HELP_ITEM_OPENED,
  LEARNING_SATISFACTION_SIGNAL,
  TASK_ERROR_LOGGED,
  TASK_PROFICIENCY_MEASURED,
  USER_PROFICIENCY_MILESTONE,
} from './utils/constants';
import {
  type TELEMETRY_PROFICIENCY_LEVEL,
  type TELEMETRY_PROFICIENCY_MILESTONE,
} from './utils/property-constants';

export const logHelpItemOpened = (
  itemId: string,
  itemLabel?: string,
  pageContext?: string,
): void => {
  eventMonitor(HELP_ITEM_OPENED, { itemId, itemLabel, pageContext });
};

export const logTaskProficiencyMeasured = (properties: {
  attemptNumber?: number;
  completionTimeSeconds?: number;
  errorCount?: number;
  taskType: string;
}): void => {
  eventMonitor(TASK_PROFICIENCY_MEASURED, properties);
};

export const logUserProficiencyMilestone = (properties: {
  daysSinceFirstUse?: number;
  milestoneName: (typeof TELEMETRY_PROFICIENCY_MILESTONE)[keyof typeof TELEMETRY_PROFICIENCY_MILESTONE];
  taskType: string;
  userId?: string;
}): void => {
  eventMonitor(USER_PROFICIENCY_MILESTONE, properties);
};

export const logFeatureDepthMeasured = (properties: {
  advancedSettingsUsed?: boolean;
  complexityScore?: number;
  featureName: string;
  optionsUsed?: string[];
}): void => {
  eventMonitor(FEATURE_DEPTH_MEASURED, properties);
};

export const logTaskErrorLogged = (properties: {
  errorType: string;
  taskType: string;
  userTenureDays?: number;
}): void => {
  eventMonitor(TASK_ERROR_LOGGED, properties);
};

export const logLearningSatisfactionSignal = (properties: {
  proficiencyLevel?: (typeof TELEMETRY_PROFICIENCY_LEVEL)[keyof typeof TELEMETRY_PROFICIENCY_LEVEL];
  satisfactionProxy?: string;
  taskType: string;
  userId?: string;
}): void => {
  eventMonitor(LEARNING_SATISFACTION_SIGNAL, properties);
};
