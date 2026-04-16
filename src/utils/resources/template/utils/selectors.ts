import { V1Template, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1Disk,
  V1Interface,
  V1Network,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getAnnotation, getLabel, getLabels, getName } from '@kubevirt-utils/resources/shared';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';

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
import { isOpenShiftTemplate, isVirtualMachineTemplate, Template } from './types';

/**
 * A selector that returns the VirtualMachine object of a given template
 * @param {Template} template - OpenShift Template or VirtualMachineTemplate
 */
export const getTemplateVirtualMachineObject = (template: Template): V1VirtualMachine => {
  const vm = isVirtualMachineTemplate(template)
    ? template?.spec?.virtualMachine
    : template?.objects?.find((obj) => obj.kind === VirtualMachineModel.kind);

  return { ...vm, cluster: getCluster(template) };
};

/**
 * returns true if the given template is a default variant
 * @param {Template} template - template
 */
export const isDefaultVariantTemplate = (template: Template): boolean =>
  getLabels(template)?.[TEMPLATE_DEFAULT_VARIANT_LABEL] === 'true';

/**
 * A selector that returns the os label name of a given template
 * @param {Template} template - template
 */
export const getTemplateOSLabelName = (template: Template): string =>
  getAnnotation(getTemplateVirtualMachineObject(template)?.spec?.template, ANNOTATIONS.os);

/**
 * A selector that returns the os label of a given template
 * @param {Template} template - template
 */
export const getTemplateOS = (template: Template): OS_NAME_TYPES => {
  const templateOS = getTemplateOSLabelName(template);
  return (
    Object.values(OS_NAME_TYPES).find((osName) => templateOS?.includes(osName)) ??
    OS_NAME_TYPES.other
  );
};

/**
 * A selector that returns the template provider name of a given template
 * @param {V1Template} template - template
 */
export const getTemplateProviderName = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.providerDisplayName);

/**
 * A selector that returns the support level of a given template
 * @param {V1Template} template - template
 */
export const getTemplateSupportLevel = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.supportLevel);

/**
 * A selector that returns the containerDisks of a given template
 * @param {V1Template} template - template
 * @returns {string[]} array of containerDisks
 */
export const getTemplateContainerDisks = (template: V1Template): string[] | undefined =>
  getAnnotation(template, ANNOTATIONS.containerDisks)?.split('\n');

/**
 * A selector that returns the import URLs of a given template
 * @param {V1Template} template - template
 * @returns {string[]} array of import URLS
 */
export const getTemplateImportURLs = (template: V1Template): string[] | undefined =>
  getAnnotation(template, ANNOTATIONS.importURLs)?.split('\n');

/**
 * A selector that returns the flavor of a given template
 * @param {Template} template - template
 */
export const getTemplateFlavor = (template: Template): string => {
  // eslint-disable-next-line require-jsdoc
  const isFlavorExist = (flavor: string) =>
    getLabel(template, `${TEMPLATE_FLAVOR_LABEL}/${flavor}`) === 'true';

  return Object.values(FLAVORS).find((flavor) => isFlavorExist(flavor)) ?? 'unknown';
};

/**
 * A selector that returns the workload of a given template
 * @param {Template} template - template
 */
export const getTemplateWorkload = (template: Template): string => {
  // eslint-disable-next-line require-jsdoc
  const isWorkloadExist = (workload: string) =>
    getLabel(template, `${TEMPLATE_WORKLOAD_LABEL}/${workload}`) === 'true';

  return Object.values(WORKLOADS).find((flavor) => isWorkloadExist(flavor)) ?? 'unknown';
};

/**
 * A selector that returns the networks of a given template
 * @param {Template} template - template
 */
export const getTemplateNetworks = (template: Template): V1Network[] => {
  return getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.networks ?? [];
};

/**
 * A selector that returns the interfaces of a given template
 * @param {Template} template - template
 */
export const getTemplateInterfaces = (template: Template): V1Interface[] => {
  return (
    getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.domain?.devices?.interfaces ??
    []
  );
};

/**
 * A selector that returns the disks of a given template
 * @param {V1Template} template - template
 */
export const getTemplateDisks = (template: V1Template): V1Disk[] => {
  return (
    getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.domain?.devices?.disks ?? []
  );
};

/**
 * A selector that returns the parameters of a given template
 * @param {Template} template - template
 */
export const getParameters = (template: Template) =>
  isOpenShiftTemplate(template) ? template?.parameters : template?.spec?.parameters;

/**
 * A selector that returns the value of a given template's parameter
 * @param {Template} template - template
 * @param {string} parameter - parameter name
 */
export const getTemplateParameterValue = (template: Template, parameter: string): string => {
  return getParameters(template)?.find((param) => param.name === parameter)?.value ?? '';
};

/**
 * A selector that returns the documentation URL of a given template
 * @param {V1Template} template - template
 */
export const getTemplateDocumentationURL = (template: V1Template): string =>
  getAnnotation(template, ANNOTATIONS.documentationURL);

/**
 * A selector that returns the name of a given template
 * @param {Template} template - template
 */
export const getTemplateName = (template: Template): string =>
  getAnnotation(template, ANNOTATIONS.displayName, getName(template));

/**
 * A selector that returns the PVC name of a given template's base image
 * @param {Template} template - template
 */
export const getTemplatePVCName = (template: Template): string =>
  getTemplateParameterValue(template, TEMPLATE_BASE_IMAGE_NAME_PARAMETER) ||
  getTemplateParameterValue(template, TEMPLATE_DATA_SOURCE_NAME_PARAMETER);

/**
 * A selector that returns the description of a given template
 * @param {Template} template - template
 */
export const getTemplateDescription = (template: Template): string =>
  getAnnotation(template, ANNOTATIONS.description);

/**
 * A selector that returns the CPU of a given template
 * @param {V1Template} template - template
 */
export const getTemplateVirtualMachineCPU = (template: V1Template) =>
  getCPU(getTemplateVirtualMachineObject(template));
