import { TFunction } from 'react-i18next';

import {
  ProcessedTemplatesModel,
  TemplateParameter,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  generateVMName,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { NAME_INPUT_FIELD } from './constants';
import { overrideTemplate } from './overrides';

export const isFieldInvalid = (field: TemplateParameter, formData: FormData): boolean =>
  (formData.get(field.name) as string).length === 0;

export const setTemplateParameters = (template: V1Template, formData: FormData): void => {
  template.parameters.forEach((parameter) => {
    const formParameter = formData.get(parameter.name) as string;
    if (formParameter.length > 0) parameter.value = formParameter;
  });
};

export const replaceTemplateParameterValue = (
  template: V1Template,
  parameterName: string,
  value: string,
): void => {
  const parameterToReplace = template.parameters.find(
    (parameter) => parameter.name === parameterName,
  );

  if (parameterToReplace) parameterToReplace.value = value;
};

export const hasCustomizableDiskSource = (template: V1Template): boolean => {
  const virtualMachine = getTemplateVirtualMachineObject(template);
  const dataVolumeTemplates = virtualMachine?.spec?.dataVolumeTemplates;

  if (!dataVolumeTemplates || dataVolumeTemplates.length !== 1) return false;

  if (!dataVolumeTemplates[0].spec.source && !dataVolumeTemplates[0].spec.sourceRef) return false;

  return true;
};

export const extractParameterNameFromMetadataName = (template: V1Template): string => {
  const virtualMachineObject = getTemplateVirtualMachineObject(template);
  return virtualMachineObject?.metadata.name?.replace(/[${}\"]+/g, '');
};

export const processTemplate = async (
  template: V1Template,
  formData: FormData,
  customSource?: V1beta1DataVolumeSpec,
): Promise<V1Template> => {
  const virtualMachineName = formData.get(NAME_INPUT_FIELD) as string;

  const parameterForName = extractParameterNameFromMetadataName(template);

  setTemplateParameters(template, formData);

  replaceTemplateParameterValue(template, parameterForName, virtualMachineName);

  const processedTemplate = await k8sCreate<V1Template>({
    model: ProcessedTemplatesModel,
    data: overrideTemplate(template, virtualMachineName, customSource),
    queryParams: {
      dryRun: 'All',
    },
  });

  return processedTemplate;
};

export const getVirtualMachineNameField = (
  template: V1Template,
  t: TFunction,
): TemplateParameter => {
  return {
    required: true,
    name: NAME_INPUT_FIELD,
    displayName: t('Name'),
    description: t('Virtual Machine Name'),
    value: generateVMName(template),
  };
};

export type FormErrors = {
  parameters?: { [key: string]: string };
  diskSource?: string;
  volume?: string;
};

export const getTemplateStorageQuantity = (template: V1Template): string | undefined => {
  const dataVolumeTemplates = getTemplateVirtualMachineObject(template)?.spec?.dataVolumeTemplates;

  return dataVolumeTemplates?.[0]?.spec?.storage?.resources?.requests?.storage;
};

export const buildFields = (template: V1Template): Array<TemplateParameter[]> => {
  const parameterForName = extractParameterNameFromMetadataName(template);

  const optionalFields = template.parameters?.filter(
    (parameter) => !parameter.required && parameterForName !== parameter.name,
  );
  const requiredFields = template.parameters?.filter(
    (parameter) => parameter.required && parameterForName !== parameter.name,
  );

  return [requiredFields, optionalFields];
};
