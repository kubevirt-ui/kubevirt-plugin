import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1Disk, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAnnotation, getLabel } from '@kubevirt-utils/resources/shared';

import { ANNOTATIONS } from '../../utils/annotations';
import {
  FLAVORS,
  OS_NAME_TYPES,
  TEMPLATE_DEFAULT_VARIANT_LABEL,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  WORKLOADS,
} from '../../utils/constants';
import { getTemplateName, getTemplateVirtualMachineObject } from '../../utils/templateGetters';
import { TemplateFilters } from '../hooks/useVmTemplatesFilters';

export const isDefaultVariantTemplate = (template: V1Template): boolean =>
  template?.metadata?.labels?.[TEMPLATE_DEFAULT_VARIANT_LABEL] === 'true';

export const getTemplateOSLabelName = (template: V1Template): string =>
  getLabel(template, ANNOTATIONS.osTemplate, template?.metadata?.name);

export const getTemplateProviderName = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.providerDisplayName, template?.metadata?.name);

export const getTemplateSupportLevel = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.supportLevel);

export const getTemplateFlavor = (template: V1Template): string => {
  const isFlavorExist = (flavor: string) =>
    getLabel(template, `${TEMPLATE_FLAVOR_LABEL}/${flavor}`) === 'true';

  return Object.values(FLAVORS).find((flavor) => isFlavorExist(flavor)) ?? 'unknown';
};

export const getTemplateWorkload = (template: V1Template): string => {
  const isWorkloadExist = (workload: string) =>
    getLabel(template, `${TEMPLATE_WORKLOAD_LABEL}/${workload}`) === 'true';

  return Object.values(WORKLOADS).find((flavor) => isWorkloadExist(flavor)) ?? 'unknown';
};

export const getTemplateOS = (template: V1Template): string => {
  return (
    Object.values(OS_NAME_TYPES).find((osName) =>
      getTemplateOSLabelName(template).includes(osName),
    ) ?? OS_NAME_TYPES.other
  );
};

export const getTemplateNetworkInterfaces = (template: V1Template): V1Network[] => {
  return getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.networks ?? [];
};

export const getTemplateDisks = (template: V1Template): V1Disk[] => {
  return (
    getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.domain?.devices?.disks ?? []
  );
};

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

    const defaultVariantFilter = filters?.onlyDefault ? isDefaultVariantTemplate(tmp) : true;

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
