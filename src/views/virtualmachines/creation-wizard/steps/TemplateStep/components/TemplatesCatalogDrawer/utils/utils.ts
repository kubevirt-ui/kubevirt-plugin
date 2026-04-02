import { TemplateParameter, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1DataVolumeSpec,
  V1ContainerDiskSource,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { NAME_INPUT_FIELD } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';

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
  template: V1Template,
  parameterName: string,
  value: string,
): V1Template => {
  template.parameters = template.parameters.map((parameter) => {
    if (parameter.name === parameterName) parameter.value = value;

    return parameter;
  });

  return template;
};
