import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1Disk, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAnnotation, getLabel } from '@kubevirt-utils/resources/shared';

import { ANNOTATIONS } from './annotations';
import {
  FLAVORS,
  OS_NAME_TYPES,
  TEMPLATE_BASE_IMAGE_NAME_PARAMETER,
  TEMPLATE_DATA_SOURCE_NAME_PARAMETER,
  TEMPLATE_DEFAULT_VARIANT_LABEL,
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
  WORKLOADS,
} from './constants';

export const getTemplateVirtualMachineObject = (template: V1Template): V1VirtualMachine =>
  template?.objects?.find((obj) => obj.kind === VirtualMachineModel.kind);

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

export const getTemplateParameterValue = (template: V1Template, parameter): string => {
  return template?.parameters?.find((param) => param.name === parameter)?.value ?? '';
};

export const getTemplateDocumentationURL = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.documentationURL);

export const getTemplateName = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.displayName, template?.metadata?.name);

export const getTemplatePVCName = (template: V1Template): string =>
  getTemplateParameterValue(template, TEMPLATE_BASE_IMAGE_NAME_PARAMETER) ||
  getTemplateParameterValue(template, TEMPLATE_DATA_SOURCE_NAME_PARAMETER);

export const getTemplateDescription = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.description);

export const generateVMName = (template: V1Template): string => {
  return `${getTemplatePVCName(template) ?? template?.metadata?.name}-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
};
