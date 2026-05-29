import {
  EDITOR_VIEW_SWITCHED,
  RESOURCE_CREATED,
  RESOURCE_YAML_EDITED_POST_CREATION,
} from './utils/constants';
import {
  EditorViewSwitchTelemetry,
  ResourceCreationMethodTelemetry,
  ResourceTypeTelemetry,
} from './utils/types';
import { eventMonitor } from './telemetry';

export const logResourceCreated = (
  resourceType: ResourceTypeTelemetry,
  creationMethod: ResourceCreationMethodTelemetry,
) => {
  eventMonitor(RESOURCE_CREATED, { creationMethod, resourceType });
};

export const logEditorViewSwitched = (
  resourceType: ResourceTypeTelemetry,
  switchDirection: EditorViewSwitchTelemetry,
  stepOrField?: string,
) => {
  eventMonitor(EDITOR_VIEW_SWITCHED, { resourceType, stepOrField, switchDirection });
};

export const logResourceYamlEditedPostCreation = (
  resourceType: ResourceTypeTelemetry,
  timeSinceCreationSeconds: number,
  fieldsModified?: string[],
) => {
  eventMonitor(RESOURCE_YAML_EDITED_POST_CREATION, {
    fieldsModified,
    resourceType,
    timeSinceCreationSeconds,
  });
};
