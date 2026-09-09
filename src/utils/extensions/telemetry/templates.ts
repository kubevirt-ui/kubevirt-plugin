import { getName } from '@kubevirt-utils/resources/shared';
import { type Template } from '@kubevirt-utils/resources/template';

import { eventMonitor } from './telemetry';
import { TEMPLATE_CREATED, TEMPLATE_EDITED } from './utils/constants';
import { getTemplateTypeTelemetry } from './vm-creation';

export const logTemplateCreated = (properties: {
  osType?: string;
  sourceVmId?: string;
  workloadProfile?: string;
}): void => {
  eventMonitor(TEMPLATE_CREATED, properties);
};

export const logTemplateEdited = (template: Template, fieldsChanged?: string[]): void => {
  eventMonitor(TEMPLATE_EDITED, {
    fieldsChanged,
    templateName: getName(template),
    templateType: getTemplateTypeTelemetry(template),
  });
};
