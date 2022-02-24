import { TFunction } from 'react-i18next';

import {
  ProcessedTemplatesModel,
  TemplateParameter,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { generateVMName, getTemplateVirtualMachineObject } from '../utils/templateGetters';

import { DISK_SOURCE } from './components/DiskSource';
import { DEFAULT_NAMESPACE, NAME_INPUT_FIELD } from './constants';
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
  namespace: string,
  formData: FormData,
  diskSourceCustomization: DISK_SOURCE,
): Promise<V1Template> => {
  const virtualMachineName = formData.get(NAME_INPUT_FIELD) as string;

  const parameterForName = extractParameterNameFromMetadataName(template);

  setTemplateParameters(template, formData);

  replaceTemplateParameterValue(template, parameterForName, virtualMachineName);

  const processedTemplate = await k8sCreate<V1Template>({
    model: ProcessedTemplatesModel,
    data: overrideTemplate(
      template,
      namespace || DEFAULT_NAMESPACE,
      virtualMachineName,
      diskSourceCustomization,
    ),
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

export const formValidation = (
  t: TFunction,
  formData: FormData,
  requiredFields: TemplateParameter[],
  diskSource?: DISK_SOURCE,
): FormErrors | undefined => {
  let parametersError = undefined;
  let diskSourceError = undefined;
  let volumeError = undefined;

  const requiredFieldsNoValue = requiredFields.filter((field) => isFieldInvalid(field, formData));
  if (requiredFieldsNoValue.length > 0) {
    parametersError = requiredFieldsNoValue.reduce((accumulator, field) => {
      accumulator[field.name] = t('This field is required');
      return accumulator;
    }, {});
  }

  if (
    diskSource?.source?.pvc &&
    (!diskSource.source.pvc.name || !diskSource.source.pvc.namespace)
  ) {
    diskSourceError = t('Please provide name and namespace for the pvc');
  }

  if (diskSource?.source?.http && diskSource.source.http.url.length === 0)
    diskSourceError = t('Please provide a valid Image URL');

  if (diskSource?.source?.registry && diskSource.source.registry.url.length === 0)
    diskSourceError = t('Please provide a valid Container URL');

  if (diskSource?.storage) {
    const parsedStorage = parseInt(diskSource?.storage, 10);

    if (isNaN(parsedStorage) || parsedStorage <= 0) volumeError = t('Volume size not valid');
  }

  if (diskSourceError || parametersError || volumeError)
    return {
      volume: volumeError,
      diskSource: diskSourceError,
      parameters: parametersError,
    };
};

export const getTemplateStorageQuantity = (template: V1Template): string | undefined => {
  const dataVolumeTemplates = getTemplateVirtualMachineObject(template)?.spec?.dataVolumeTemplates;

  return dataVolumeTemplates?.[0]?.spec?.storage?.resources?.requests?.storage;
};
