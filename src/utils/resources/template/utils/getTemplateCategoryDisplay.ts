import { type TFunction } from 'i18next';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { WORKLOADS_LABELS } from './constants';
import { getTemplateCategory, getTemplateWorkload } from './selectors';
import { isVirtualMachineTemplate, type Template } from './types';

/**
 * Returns Category for VMTs and Workload profile for OpenShift templates.
 * @param template
 * @param t
 */
export const getTemplateCategoryDisplay = (template: Template, t: TFunction): string => {
  if (isVirtualMachineTemplate(template)) {
    return getTemplateCategory(template) ?? NO_DATA_DASH;
  }

  const workload = getTemplateWorkload(template);
  return WORKLOADS_LABELS[workload] ? t(WORKLOADS_LABELS[workload]) : NO_DATA_DASH;
};
