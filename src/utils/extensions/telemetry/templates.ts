import { getName } from '@kubevirt-utils/resources/shared';
import { Template } from '@kubevirt-utils/resources/template';

import { TEMPLATE_CREATED, TEMPLATE_EDITED } from './utils/constants';
import { eventMonitor } from './telemetry';
import { getTemplateTypeTelemetry } from './vm-creation';

export const logTemplateCreated = (properties: {
  osType?: string;
  sourceVmId?: string;
  workloadProfile?: string;
}) => {
  eventMonitor(TEMPLATE_CREATED, properties);
};

export const logTemplateEdited = (template: Template, fieldsChanged?: string[]) => {
  eventMonitor(TEMPLATE_EDITED, {
    fieldsChanged,
    templateName: getName(template),
    templateType: getTemplateTypeTelemetry(template),
  });
};
