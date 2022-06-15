import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import {
  getTemplateName,
  getTemplateOS,
  getTemplateWorkload,
  isCustomTemplate,
  isDefaultVariantTemplate,
} from '@kubevirt-utils/resources/template/utils/selectors';

import { TemplateFilters } from '../hooks/useVmTemplatesFilters';

export const filterTemplates = (templates: V1Template[], filters: TemplateFilters): V1Template[] =>
  templates
    .filter((tmp) => {
      const textFilterLowerCase = filters?.query.toLowerCase();
      const workload = getTemplateWorkload(tmp);

      const textFilter = textFilterLowerCase
        ? getTemplateName(tmp).toLowerCase().includes(textFilterLowerCase) ||
          tmp?.metadata?.name?.includes(textFilterLowerCase)
        : true;

      const defaultVariantFilter = filters?.onlyDefault
        ? isDefaultVariantTemplate(tmp) || isCustomTemplate(tmp)
        : true;

      const workloadFilter = filters?.workload?.size > 0 ? filters.workload.has(workload) : true;

      const osNameFilter =
        filters?.osName?.size > 0 ? filters?.osName?.has(getTemplateOS(tmp)) : true;

      return defaultVariantFilter && textFilter && workloadFilter && osNameFilter;
    })
    // show RHEL templates first, then alphabetically
    .sort((a, b) => {
      if (getTemplateOS(a) === OS_NAME_TYPES.rhel) {
        return -1;
      }
      if (getTemplateOS(b) === OS_NAME_TYPES.rhel) {
        return 1;
      }

      const aName = getTemplateName(a) || a?.metadata?.name;
      const bName = getTemplateName(b) || b?.metadata?.name;

      return aName?.localeCompare(bName);
    });
