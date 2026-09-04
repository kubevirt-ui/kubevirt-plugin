/* eslint-disable */
import { type TFunction } from 'i18next';

import { type TemplateParameter } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1DataVolumeSpec,
  type V1ContainerDiskSource,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type V1beta1VirtualMachineTemplateSpecParameters } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import {
  getParameters,
  isOpenShiftTemplate,
  isVirtualMachineTemplate,
  type Template,
} from '@kubevirt-utils/resources/template';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { NAME_INPUT_FIELD } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';

export const getRequiredTemplateParameter = (parameters: TemplateParameter[]) => {
  return (parameters ?? []).filter(
    (parameter) => parameter.name !== NAME_INPUT_FIELD && parameter.required,
  );
};

export const getDiskSource = (
  vm: V1VirtualMachine,
  diskName: string,
): undefined | V1beta1DataVolumeSpec | V1ContainerDiskSource => {
  if (!diskName) return;

  const disk = getDisks(vm)?.find((d) => d.name === diskName);
  const volume = getVolumes(vm)?.find((v) => v.name === disk?.name);

  if (!disk || !volume) return;

  if (volume.containerDisk) {
    return volume.containerDisk;
  }

  if (volume.dataVolume) {
    const dataVolumeTemplate = vm.spec?.dataVolumeTemplates?.find(
      (template) => template.metadata?.name === volume.dataVolume.name,
    );

    return dataVolumeTemplate?.spec;
  }
};

export const changeTemplateParameterValue = (
  template: Template,
  parameterName: string,
  value: string,
): Template => {
  const parameters = getParameters(template)?.map((parameter) => {
    if (parameter.name === parameterName) parameter.value = value;

    return parameter;
  });

  if (isOpenShiftTemplate(template)) template.parameters = parameters;
  if (isVirtualMachineTemplate(template))
    template.spec.parameters = parameters as V1beta1VirtualMachineTemplateSpecParameters[];

  return template;
};

export const isRequiredParameterUnfulfilled = (param: TemplateParameter): boolean =>
  Boolean(param.required) &&
  param.name !== NAME_INPUT_FIELD &&
  !param.value?.trim() &&
  !param.generate;

export const getFirstUnfulfilledRequiredParameter = (
  template: Template,
): TemplateParameter | undefined =>
  (getParameters(template) ?? []).find(isRequiredParameterUnfulfilled);

export const allRequiredParametersAreFulfilled = (template: Template): boolean =>
  !getFirstUnfulfilledRequiredParameter(template);

export const getPasswordParameterValueError = (
  t: TFunction,
  value: string,
  parameterExpression: string,
): string | undefined => {
  if (isEmpty(parameterExpression) && isEmpty(value)) {
    return t('Password must contain at least 1 character');
  }

  const parameterRegex = new RegExp(`^${parameterExpression}$`);
  const isValid = parameterRegex.test(value);

  if (isValid) {
    return;
  }

  return t('Password must match the pattern: {{pattern}}', { pattern: parameterExpression });
};

export const hasPasswordParameterValueError = (
  t: TFunction,
  value: string,
  parameterExpression: string,
): boolean => Boolean(getPasswordParameterValueError(t, value, parameterExpression));

export const isSomeParametersHavValidationError = (
  parameters: TemplateParameter[],
  t: TFunction,
): boolean =>
  parameters.some((parameter) =>
    hasPasswordParameterValueError(t, parameter.value ?? '', parameter.from ?? ''),
  );
