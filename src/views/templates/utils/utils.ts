import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  getTemplateVirtualMachineObject,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
} from '@kubevirt-utils/resources/template';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';

export const isCommonVMTemplate = (template: V1Template): boolean =>
  template?.metadata?.labels?.[TEMPLATE_TYPE_LABEL] === TEMPLATE_TYPE_BASE;

export const isDedicatedCPUPlacement = (template: V1Template): boolean =>
  getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.domain?.cpu
    ?.dedicatedCpuPlacement;

// check if the descheduler is ON
export const isDeschedulerOn = (template: V1Template): boolean =>
  // check for the descheduler.alpha.kubernetes.io/evict: 'true' annotation
  getTemplateVirtualMachineObject(template)?.spec?.template?.metadata?.annotations?.[
    DESCHEDULER_EVICT_LABEL
  ] === 'true';

export const ensurePath = <T extends object>(data: T, paths: string | string[]) => {
  let current = data;

  if (Array.isArray(paths)) {
    paths.forEach((path) => ensurePath(data, path));
  } else {
    const keys = paths.split('.');

    for (const key of keys) {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
  }
};
