import produce from 'immer';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1beta1DataVolumeSource,
  V1beta1DataVolumeSpec,
  V1DataVolumeTemplateSpec,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';

import {
  INSTALLATION_CDROM_DISK,
  INSTALLATION_CDROM_NAME,
  INSTALLATION_CDROM_VOLUME,
  INSTALLATION_CDROM_VOLUME_NAME,
} from './constants';

export const addInstallationCDRom = (
  virtualMachine: V1VirtualMachine,
  cdSource: V1beta1DataVolumeSource,
): V1VirtualMachine => {
  let cdVolume: V1Volume = undefined;
  let cdDataVolumeTemplate: V1DataVolumeTemplateSpec = undefined;

  if (cdSource.registry) {
    cdVolume = {
      name: INSTALLATION_CDROM_NAME,
      containerDisk: {
        image: cdSource.registry.url,
      },
    };
  } else if (cdSource.http || cdSource.pvc) {
    cdVolume = INSTALLATION_CDROM_VOLUME;

    cdDataVolumeTemplate = {
      metadata: { name: INSTALLATION_CDROM_VOLUME_NAME },
      spec: { source: cdSource },
    };
  }

  if (!cdVolume) return virtualMachine;

  const dataVolumeTemplates = cdDataVolumeTemplate
    ? [...virtualMachine.spec?.dataVolumeTemplates, cdDataVolumeTemplate]
    : virtualMachine.spec?.dataVolumeTemplates;

  return produceVMDisks(virtualMachine, (draftVM) => {
    draftVM.spec.dataVolumeTemplates = dataVolumeTemplates;
    draftVM.spec.template.spec.domain.devices.disks.push(INSTALLATION_CDROM_DISK);
    draftVM.spec.template.spec.volumes.push(cdVolume);
  });
};

export const addCDToTemplate = (
  template: V1Template,
  cdSource: V1beta1DataVolumeSpec,
): V1Template => {
  return produce(template, (draftTemplate) => {
    if (!cdSource) return draftTemplate;
    let virtualMachine = getTemplateVirtualMachineObject(draftTemplate);
    virtualMachine = addInstallationCDRom(virtualMachine, cdSource.source);

    return { ...draftTemplate, objects: [virtualMachine] };
  });
};
