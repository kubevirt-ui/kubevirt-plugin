import { TFunction } from 'react-i18next';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataVolumeSpec,
  V1ContainerDiskSource,
  V1DataVolumeTemplateSpec,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';
import { CDI_BIND_REQUESTED_ANNOTATION } from '@kubevirt-utils/hooks/useCDIUpload/consts';
import { getTemplateContainerDisks } from '@kubevirt-utils/resources/template';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getRootDataVolume } from '../utils';

export const getRegistryHelperText = (template: V1Template, t: TFunction) => {
  const containerDisks = getTemplateContainerDisks(template);

  if (!isEmpty(containerDisks))
    return t('Enter a container image (for example: {{containerDisk}})', {
      containerDisk: containerDisks[0],
    });
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

const emptySourceDataVolume: V1DataVolumeTemplateSpec = {
  apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
  kind: DataVolumeModel.kind,
  metadata: {
    name: `dv-${ROOTDISK}`,
  },
  spec: {},
};

const createDataVolumeWithSource = (customSource: V1beta1DataVolumeSpec) => ({
  ...emptySourceDataVolume,
  spec: customSource,
});

export const overrideVirtualMachineDataVolumeSpec = (
  virtualMachine: V1VirtualMachine,
  customSource?: V1beta1DataVolumeSpec,
): V1VirtualMachine => {
  return produceVMDisks(virtualMachine, (draftVM) => {
    const rootDataVolume = getRootDataVolume(draftVM);

    if (isEmpty(customSource)) return;

    if (isEmpty(rootDataVolume)) {
      draftVM.spec.template.spec.volumes = getVolumes(draftVM).filter((v) => v.name !== ROOTDISK);
      draftVM.spec.template.spec.volumes.push({
        dataVolume: {
          name: `dv-${ROOTDISK}`,
        },
        name: ROOTDISK,
      });

      draftVM.spec.dataVolumeTemplates ??= [];
      draftVM.spec.dataVolumeTemplates.push(createDataVolumeWithSource(customSource));

      return;
    }

    rootDataVolume.spec = customSource;

    if (customSource?.source?.blank || customSource?.source?.upload) {
      rootDataVolume.metadata.annotations = {
        ...(rootDataVolume?.metadata?.annotations || {}),
        [CDI_BIND_REQUESTED_ANNOTATION]: 'true',
      };
    }
  });
};
