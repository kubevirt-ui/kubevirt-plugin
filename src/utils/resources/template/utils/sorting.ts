import { universalComparator } from '@kubevirt-utils/utils/utils';

import { OS_NAME_TYPES } from './constants';
import { getTemplateName, getTemplateOS } from './selectors';
import type { Template, TemplateOrRequest } from './types';
import { isVirtualMachineTemplate, isVirtualMachineTemplateRequest } from './types';

const getSortPriority = (item: TemplateOrRequest): number => {
  if (isVirtualMachineTemplateRequest(item)) return 0;
  if (isVirtualMachineTemplate(item)) return 1;
  if (getTemplateOS(item as Template) === OS_NAME_TYPES.Rhel) return 2;
  return 3;
};

export const sortTemplates = (templates: Template[]): Template[] =>
  [...templates].sort((a, b) => {
    const priorityDiff = getSortPriority(a) - getSortPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return universalComparator(getTemplateName(a) ?? '', getTemplateName(b) ?? '');
  });
