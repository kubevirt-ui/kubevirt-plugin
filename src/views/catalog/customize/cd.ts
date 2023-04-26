import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1beta1DataVolumeSpec,
  V1ContainerDiskSource,
  V1DataVolumeTemplateSpec,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';

import { removeDockerPrefix } from './components/CustomizeSource/utils';
import { INSTALLATION_CDROM_DISK, INSTALLATION_CDROM_NAME } from './constants';

export const addInstallationCDRom = (
  virtualMachine: V1VirtualMachine,
  cdSource: V1beta1DataVolumeSpec | V1ContainerDiskSource,
): V1VirtualMachine => {
  let cdVolume: V1Volume = undefined;
  let cdDataVolumeTemplate: V1DataVolumeTemplateSpec = undefined;
  const dataVolumeName = `${virtualMachine?.metadata?.name}-${INSTALLATION_CDROM_NAME}`;

  if ((cdSource as V1ContainerDiskSource)?.image) {
    cdVolume = {
      name: INSTALLATION_CDROM_NAME,
      containerDisk: {
        image: removeDockerPrefix((cdSource as V1ContainerDiskSource).image),
      },
    };
  }

  const cdDataVolumeSource = (cdSource as V1beta1DataVolumeSpec)?.source;

  if (cdDataVolumeSource?.registry) {
    cdVolume = {
      name: INSTALLATION_CDROM_NAME,
      containerDisk: {
        image: removeDockerPrefix(cdDataVolumeSource?.registry.url),
      },
    };
  } else if (cdDataVolumeSource?.http || cdDataVolumeSource?.pvc) {
    cdVolume = {
      name: INSTALLATION_CDROM_NAME,
      dataVolume: {
        name: dataVolumeName,
      },
    };

    cdDataVolumeTemplate = {
      metadata: { name: dataVolumeName },
      spec: { source: cdDataVolumeSource, storage: (cdSource as V1beta1DataVolumeSpec)?.storage },
    };
  } else if (cdDataVolumeSource?.upload) {
    cdVolume = {
      name: INSTALLATION_CDROM_NAME,
      persistentVolumeClaim: {
        claimName: dataVolumeName,
      },
    };
  }

  if (!cdVolume) return virtualMachine;

  const dataVolumeTemplates = cdDataVolumeTemplate
    ? [...virtualMachine.spec?.dataVolumeTemplates, cdDataVolumeTemplate]
    : virtualMachine.spec?.dataVolumeTemplates;

  return produceVMDisks(virtualMachine, (draftVM) => {
    draftVM.spec.dataVolumeTemplates = dataVolumeTemplates;
    draftVM.spec.template.spec.domain.devices.disks =
      draftVM.spec.template.spec.domain.devices.disks.map((disk, index) => ({
        ...disk,
        bootOrder: 2 + index,
      }));
    draftVM.spec.template.spec.domain.devices.disks.push(INSTALLATION_CDROM_DISK);
    draftVM.spec.template.spec.volumes.push(cdVolume);
  });
};

export const addCDToTemplate = (
  template: V1Template,
  cdSource: V1beta1DataVolumeSpec | V1ContainerDiskSource,
): V1Template => {
  const virtualMachine = addInstallationCDRom(getTemplateVirtualMachineObject(template), cdSource);

  return replaceTemplateVM(template, virtualMachine);
};
