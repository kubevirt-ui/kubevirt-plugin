import { isCommonTemplate, Template } from '@kubevirt-utils/resources/template';
import { VMCreationMethod, VMWizardStep } from '@virtualmachines/creation-wizard/utils/constants';

import { VM_CREATED, VM_CREATION_FAILED, VM_CREATION_STARTED } from './utils/constants';
import {
  TELEMETRY_TASK_ERROR_TYPE,
  TELEMETRY_TASK_TYPE,
  TELEMETRY_TEMPLATE_TYPE,
  TELEMETRY_VM_CREATION_METHOD,
} from './utils/property-constants';
import { TemplateTypeTelemetry, VMCreationMethodTelemetry } from './utils/types';
import { logTaskErrorLogged, logTaskProficiencyMeasured } from './learning';
import { eventMonitor, getTelemetryErrorMessage } from './telemetry';

export const mapCreationMethodToTelemetry = (
  method: VMCreationMethod,
): VMCreationMethodTelemetry => {
  switch (method) {
    case VMCreationMethod.TEMPLATE:
      return TELEMETRY_VM_CREATION_METHOD.TEMPLATE;
    case VMCreationMethod.CLONE:
      return TELEMETRY_VM_CREATION_METHOD.CLONE;
    case VMCreationMethod.INSTANCE_TYPE:
    default:
      return TELEMETRY_VM_CREATION_METHOD.INSTANCE_TYPE;
  }
};

export const mapWizardStepToCreationMethodTelemetry = (
  stepId: string,
): undefined | VMCreationMethodTelemetry => {
  switch (stepId) {
    case VMWizardStep.CLONE:
      return TELEMETRY_VM_CREATION_METHOD.CLONE;
    case VMWizardStep.TEMPLATE:
      return TELEMETRY_VM_CREATION_METHOD.TEMPLATE;
    case VMWizardStep.GUEST_OS:
      return TELEMETRY_VM_CREATION_METHOD.INSTANCE_TYPE;
    default:
      return undefined;
  }
};

export const getTemplateTypeTelemetry = (template: Template): TemplateTypeTelemetry =>
  isCommonTemplate(template)
    ? TELEMETRY_TEMPLATE_TYPE.PREDEFINED
    : TELEMETRY_TEMPLATE_TYPE.USER_DEFINED;

export const logVMCreationStarted = (creationMethod: VMCreationMethodTelemetry) => {
  eventMonitor(VM_CREATION_STARTED, { creationMethod });
};

export const logVMCreated = (
  creationMethod: VMCreationMethodTelemetry,
  options?: { templateType?: TemplateTypeTelemetry },
) => {
  eventMonitor(VM_CREATED, {
    creationMethod,
    ...(options?.templateType && { templateType: options.templateType }),
  });

  logTaskProficiencyMeasured({
    errorCount: 0,
    taskType: TELEMETRY_TASK_TYPE.VM_CREATION,
  });
};

export const logVMCreationFailed = (
  creationMethod: VMCreationMethodTelemetry,
  error: unknown,
  options?: { templateType?: TemplateTypeTelemetry },
) => {
  const errorMessage = getTelemetryErrorMessage(error);
  const errorCode = (error as { code?: string })?.code;

  eventMonitor(VM_CREATION_FAILED, {
    creationMethod,
    errorMessage,
    ...(errorCode && { errorCode }),
    ...(options?.templateType && { templateType: options.templateType }),
  });

  logTaskErrorLogged({
    errorType: errorCode ?? TELEMETRY_TASK_ERROR_TYPE.VM_CREATION_FAILED,
    taskType: TELEMETRY_TASK_TYPE.VM_CREATION,
  });
};

export const logVMCreatedFromTemplate = (template: Template) => {
  logVMCreated(TELEMETRY_VM_CREATION_METHOD.TEMPLATE, {
    templateType: getTemplateTypeTelemetry(template),
  });
};

export const logVMCreationFailedFromTemplate = (template: Template, error: unknown) => {
  logVMCreationFailed(TELEMETRY_VM_CREATION_METHOD.TEMPLATE, error, {
    templateType: getTemplateTypeTelemetry(template),
  });
};
