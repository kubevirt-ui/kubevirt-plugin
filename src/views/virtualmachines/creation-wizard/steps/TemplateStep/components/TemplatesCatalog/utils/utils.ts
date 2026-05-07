import {
  getTemplateName,
  getTemplateOS,
  isVirtualMachineTemplate,
  Template,
} from '@kubevirt-utils/resources/template';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template/utils/constants';
import { universalComparator } from '@kubevirt-utils/utils/utils';

const getSortPriority = (template: Template): number => {
  if (isVirtualMachineTemplate(template)) return 0;
  if (getTemplateOS(template) === OS_NAME_TYPES.rhel) return 1;
  return 2;
};

export const sortCatalogTemplates = (templates: Template[]): Template[] =>
  [...templates].sort((a, b) => {
    const priorityDiff = getSortPriority(a) - getSortPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return universalComparator(getTemplateName(a) ?? '', getTemplateName(b) ?? '');
  });
