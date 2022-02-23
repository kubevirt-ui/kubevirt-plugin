import { TFunction } from 'react-i18next';

import {
  ProcessedTemplatesModel,
  TemplateParameter,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { DEFAULT_NAMESPACE, NAME_INPUT_FIELD } from './constants';

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

const getVirtualMachineFromTemplate = (template: V1Template): V1VirtualMachine | undefined => {
  return template.objects?.find(
    (object) => object.kind === VirtualMachineModel.kind,
  ) as V1VirtualMachine;
};

export const extractParameterNameFromMetadataName = (template: V1Template): string => {
  const virtualMachineObject = getVirtualMachineFromTemplate(template);
  return virtualMachineObject?.metadata.name?.replace(/[${}\"]+/g, '');
};

const getVirtualMachineObject = (
  template: V1Template,
  namespace: string,
  name: string,
): V1VirtualMachine => {
  const virtualMachineObjectClone = getVirtualMachineFromTemplate(template);
  return {
    ...virtualMachineObjectClone,
    metadata: {
      ...virtualMachineObjectClone,
      name,
      namespace,
    },
  };
};

const getTemplateToProcess = (
  template: V1Template,
  namespace: string,
  name: string,
): V1Template => {
  return {
    ...template,
    objects: [
      getVirtualMachineObject(template, namespace, name),
      ...template.objects.filter((object) => object.kind === VirtualMachineModel.kind),
    ],
  };
};

export const createVirtualMachine = async (
  template: V1Template,
  namespace: string,
  parameterForName: string,
  formData: FormData,
): Promise<Response> => {
  const virtualMachineName = formData.get(NAME_INPUT_FIELD) as string;

  setTemplateParameters(template, formData);

  replaceTemplateParameterValue(template, parameterForName, virtualMachineName);

  const processedTemplate = await k8sCreate<V1Template>({
    model: ProcessedTemplatesModel,
    data: getTemplateToProcess(template, namespace || DEFAULT_NAMESPACE, virtualMachineName),
    queryParams: {
      dryRun: 'All',
    },
  });

  return processedTemplate;
};

export const getVirtualMachineNameField = (t: TFunction): TemplateParameter => {
  return {
    required: true,
    name: NAME_INPUT_FIELD,
    displayName: t('Name'),
    description: t('Virtual Machine Name'),
  };
};

export const buildFields = (
  template: V1Template,
  parametersToFilter: string[],
  t: TFunction,
): Array<TemplateParameter[]> => {
  const optionalFields = template.parameters?.filter(
    (parameter) => !parameter.required && !parametersToFilter.includes(parameter.name),
  );
  const requiredFields = template.parameters?.filter(
    (parameter) => parameter.required && !parametersToFilter.includes(parameter.name),
  );
  requiredFields?.unshift(getVirtualMachineNameField(t));

  return [requiredFields, optionalFields];
};
