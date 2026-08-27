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
import { type BOOT_SOURCE } from '@kubevirt-utils/resources/template/utils/constants';
import { getDisks, getVMBootSourceLabel, getVolumes } from '@kubevirt-utils/resources/vm';
import { NAME_INPUT_FIELD } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';

export const getTemplateParametersSplit = (
  parameters: TemplateParameter[],
): [required: TemplateParameter[], optional: TemplateParameter[]] =>
  (parameters ?? []).reduce(
    (acc, currentParameter) => {
      if (currentParameter.name === NAME_INPUT_FIELD) return acc;

      acc[currentParameter.required ? 0 : 1].push(currentParameter);
      return acc;
    },
    [[], []],
  );

export const getDiskSource = (
  vm: V1VirtualMachine,
  diskName: string,
): undefined | V1beta1DataVolumeSpec | V1ContainerDiskSource => {
  if (!diskName) return;

  const disk = getDisks(vm)?.find((diskItem) => diskItem.name === diskName);
  const volume = getVolumes(vm)?.find((volumeItem) => volumeItem.name === disk?.name);

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

export const getTemplateBootSourceLabel = (
  bootSourceType: BOOT_SOURCE | undefined,
  sourceRef: { name?: string; namespace?: string } | null | undefined,
  t: TFunction,
): string => {
  if (!sourceRef?.name) {
    return t(getVMBootSourceLabel(bootSourceType));
  }

  if (sourceRef.namespace) {
    return t('{{name}} ({{namespace}})', { name: sourceRef.name, namespace: sourceRef.namespace });
  }

  return sourceRef.name;
};
