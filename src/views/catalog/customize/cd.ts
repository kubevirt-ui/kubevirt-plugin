import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1beta1DataVolumeSpec,
  V1DataVolumeTemplateSpec,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';

import { INSTALLATION_CDROM_DISK, INSTALLATION_CDROM_NAME } from './constants';

export const addInstallationCDRom = (
  virtualMachine: V1VirtualMachine,
  cdSource: V1beta1DataVolumeSpec,
): V1VirtualMachine => {
  let cdVolume: V1Volume = undefined;
  let cdDataVolumeTemplate: V1DataVolumeTemplateSpec = undefined;
  const dataVolumeName = `${virtualMachine?.metadata?.name}-${INSTALLATION_CDROM_NAME}`;

  if (cdSource?.source?.registry) {
    cdVolume = {
      name: INSTALLATION_CDROM_NAME,
      containerDisk: {
        image: cdSource.source?.registry.url,
      },
    };
  } else if (cdSource?.source?.http || cdSource?.source?.pvc) {
    cdVolume = {
      name: INSTALLATION_CDROM_NAME,
      dataVolume: {
        name: dataVolumeName,
      },
    };

    cdDataVolumeTemplate = {
      metadata: { name: dataVolumeName },
      spec: { source: cdSource?.source, storage: cdSource?.storage },
    };
  } else if (cdSource?.source?.upload) {
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
  cdSource: V1beta1DataVolumeSpec,
): V1Template => {
  const virtualMachine = addInstallationCDRom(getTemplateVirtualMachineObject(template), cdSource);

  return replaceTemplateVM(template, virtualMachine);
};
