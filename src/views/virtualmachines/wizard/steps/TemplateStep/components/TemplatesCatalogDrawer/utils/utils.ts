import { type TFunction } from 'i18next';

import { type TemplateParameter } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1DataVolumeSpec,
  type V1ContainerDiskSource,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getParameters, type Template } from '@kubevirt-utils/resources/template';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { PARAMETER_VALUE_TYPES } from '@templates/details/tabs/parameters/constants';
import {
  getValueTypeFromParameter,
  isPasswordParameter,
} from '@templates/details/tabs/parameters/utils';
import { createParameterValueSchema } from '@virtualmachines/wizard/form/schema/template/createTemplateSchema';
import { NAME_INPUT_FIELD } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';

export const getRequiredTemplateParameter = (
  parameters: TemplateParameter[],
): TemplateParameter[] => {
  return (parameters ?? []).filter(
    (parameter) => parameter.name !== NAME_INPUT_FIELD && parameter.required,
  );
};

export const getDiskSource = (
  vm: V1VirtualMachine,
  diskName: string,
): undefined | V1beta1DataVolumeSpec | V1ContainerDiskSource => {
  if (!diskName) return;

  const disk = getDisks(vm)?.find((diskItem) => diskItem.name === diskName);
  const volume = getVolumes(vm)?.find((vol) => vol.name === disk?.name);

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

export const getPasswordParameterValueError = (t: TFunction, value: string): string | undefined => {
  try {
    createParameterValueSchema(t).validateSync(value);
    return undefined;
  } catch (error) {
    return (error as Error).message;
  }
};

export const hasPasswordParameterValueError = (t: TFunction, value: string): boolean =>
  Boolean(getPasswordParameterValueError(t, value));

export const hasInvalidPasswordParameter = (
  parameters: TemplateParameter[],
  t: TFunction,
): boolean =>
  parameters.some((parameter) => {
    if (
      getValueTypeFromParameter(parameter) !== PARAMETER_VALUE_TYPES.VALUE ||
      !isPasswordParameter(parameter.name)
    ) {
      return false;
    }

    return hasPasswordParameterValueError(t, parameter.value ?? '');
  });
