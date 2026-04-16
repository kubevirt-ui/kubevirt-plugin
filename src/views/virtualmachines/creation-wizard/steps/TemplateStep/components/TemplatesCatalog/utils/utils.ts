import { getName } from '@kubevirt-utils/resources/shared';
import {
  isCommonTemplate,
  isDefaultVariantTemplate,
  isDeprecatedTemplate,
  OS_NAME_TYPES,
  Template,
} from '@kubevirt-utils/resources/template';
import {
  getTemplateName,
  getTemplateOS,
  getTemplateWorkload,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';

import { TemplateFilters } from './types';

const isUserTemplate = (template: Template): boolean =>
  !isDefaultVariantTemplate(template) && !isCommonTemplate(template);

export const filterTemplates = (templates: Template[], filters: TemplateFilters): Template[] => {
  return (
    templates
      .filter((tmp) => {
        const textFilterLowerCase = filters?.query.toLowerCase();
        const workload = getTemplateWorkload(tmp);

        const textFilter =
          !textFilterLowerCase ||
          getTemplateName(tmp).toLowerCase().includes(textFilterLowerCase) ||
          getName(tmp)?.toLowerCase()?.includes(textFilterLowerCase);

        const defaultVariantFilter =
          (!filters?.onlyDefault && !hasNoDefaultUserAllFilters(filters)) ||
          isDefaultVariantTemplate(tmp);

        const userFilter = !filters.onlyUser || isUserTemplate(tmp);

        const workloadFilter = filters?.workload?.size <= 0 || filters.workload.has(workload);

        const osNameFilter = filters?.osName?.size <= 0 || filters?.osName?.has(getTemplateOS(tmp));

        const architectureFilter =
          filters?.architecture?.size <= 0 || filters?.architecture?.has(getArchitecture(tmp));

        const hideDeprecatedTemplatesFilter =
          !filters?.hideDeprecatedTemplates || !isDeprecatedTemplate(tmp);

        return (
          defaultVariantFilter &&
          userFilter &&
          textFilter &&
          workloadFilter &&
          osNameFilter &&
          architectureFilter &&
          hideDeprecatedTemplatesFilter
        );
      })
      // show RHEL templates first, then alphabetically
      .sort((a, b) => {
        const aIsRHEL = getTemplateOS(a) === OS_NAME_TYPES.rhel;
        const bIsRHEL = getTemplateOS(b) === OS_NAME_TYPES.rhel;

        if (aIsRHEL !== bIsRHEL) {
          return aIsRHEL ? -1 : 1;
        }

        const aName = getTemplateName(a) || a?.metadata?.name || '';
        const bName = getTemplateName(b) || b?.metadata?.name || '';

        return aName.localeCompare(bName);
      })
  );
};

export const hasNoDefaultUserAllFilters = (filters: TemplateFilters): boolean =>
  !filters?.allItems && !filters?.onlyDefault && !filters?.onlyUser; // none of the filters are set - when first time in
