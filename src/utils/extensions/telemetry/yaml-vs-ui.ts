import { eventMonitor } from './telemetry';
import {
  EDITOR_VIEW_SWITCHED,
  RESOURCE_CREATED,
  RESOURCE_YAML_EDITED_POST_CREATION,
} from './utils/constants';
import {
  type EditorViewSwitchTelemetry,
  type ResourceCreationMethodTelemetry,
  type ResourceTypeTelemetry,
} from './utils/types';

export const logResourceCreated = (
  resourceType: ResourceTypeTelemetry,
  creationMethod: ResourceCreationMethodTelemetry,
): void => {
  eventMonitor(RESOURCE_CREATED, { creationMethod, resourceType });
};

export const logEditorViewSwitched = (
  resourceType: ResourceTypeTelemetry,
  switchDirection: EditorViewSwitchTelemetry,
  stepOrField?: string,
): void => {
  eventMonitor(EDITOR_VIEW_SWITCHED, { resourceType, stepOrField, switchDirection });
};

export const logResourceYamlEditedPostCreation = (
  resourceType: ResourceTypeTelemetry,
  timeSinceCreationSeconds: number,
  fieldsModified?: string[],
): void => {
  eventMonitor(RESOURCE_YAML_EDITED_POST_CREATION, {
    fieldsModified,
    resourceType,
    timeSinceCreationSeconds,
  });
};
