import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  getTemplateFlavor,
  getTemplateName,
  getTemplateOS,
  getTemplateSupportLevel,
  getTemplateWorkload,
  isDefaultVariantTemplate,
} from '@kubevirt-utils/resources/template/utils/selectors';

import { TemplateFilters } from '../hooks/useVmTemplatesFilters';

export const filterTemplates = (templates: V1Template[], filters: TemplateFilters): V1Template[] =>
  templates.filter((tmp) => {
    const textFilterLowerCase = filters?.query.toLowerCase();
    const supportLevel = getTemplateSupportLevel(tmp);
    const flavor = getTemplateFlavor(tmp);
    const workload = getTemplateWorkload(tmp);

    const textFilter = textFilterLowerCase
      ? getTemplateName(tmp).toLowerCase().includes(textFilterLowerCase) ||
        tmp?.metadata?.name?.includes(textFilterLowerCase)
      : true;

    const defaultVariantFilter =
      filters?.tabView === 'onlyDefault' ? isDefaultVariantTemplate(tmp) : true;

    const supportedFilter =
      filters?.support?.value?.size > 0 ? filters?.support?.value?.has(supportLevel) : true;

    const workloadFilter =
      filters?.workload?.value?.size > 0 ? filters.workload.value.has(workload) : true;

    const flavorFilter = filters?.flavor?.value?.size > 0 ? filters.flavor.value.has(flavor) : true;

    const osNameFilter =
      filters?.osName?.value?.size > 0 ? filters?.osName?.value?.has(getTemplateOS(tmp)) : true;

    return (
      defaultVariantFilter &&
      supportedFilter &&
      textFilter &&
      flavorFilter &&
      workloadFilter &&
      osNameFilter
    );
  });
