import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import {
  V1beta1DataVolumeSpec,
  V1ContainerDiskSource,
  V1DataVolumeTemplateSpec,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { CDROM_DEVICE_NAME } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import {
  ensurePath,
  generatePrettyName,
  isEmpty,
  removeDockerPrefix,
} from '@kubevirt-utils/utils/utils';

import { createInstallationCdromDisk, INSTALLATION_CDROM_NAME } from './constants';

const createEmptyCDROMVolume = (cdromName: string): V1Volume => ({
  name: cdromName,
});

export const addInstallationCDRom = (
  virtualMachine: V1VirtualMachine,
  cdSource: V1beta1DataVolumeSpec | V1ContainerDiskSource,
  cdromName: string = INSTALLATION_CDROM_NAME,
  shouldSetBootOrder: boolean = true,
): V1VirtualMachine => {
  let cdVolume: V1Volume = undefined;
  let cdDataVolumeTemplate: V1DataVolumeTemplateSpec = undefined;
  const dataVolumeName = `${virtualMachine?.metadata?.name}-${cdromName}`;

  if (isEmpty(cdSource) || !cdSource) {
    cdVolume = createEmptyCDROMVolume(cdromName);
  } else if ('image' in cdSource) {
    cdVolume = {
      containerDisk: {
        image: removeDockerPrefix((cdSource as V1ContainerDiskSource).image),
      },
      name: cdromName,
    };
  } else {
    const cdDataVolumeSource = (cdSource as V1beta1DataVolumeSpec)?.source;

    if (cdDataVolumeSource?.registry) {
      cdVolume = {
        containerDisk: {
          image: removeDockerPrefix(cdDataVolumeSource?.registry.url),
        },
        name: cdromName,
      };
    }
    if (cdDataVolumeSource?.http || cdDataVolumeSource?.pvc || cdDataVolumeSource?.upload) {
      cdVolume = {
        dataVolume: {
          name: dataVolumeName,
        },
        name: cdromName,
      };

      cdDataVolumeTemplate = {
        metadata: { name: dataVolumeName },
        spec: { source: cdDataVolumeSource, storage: (cdSource as V1beta1DataVolumeSpec)?.storage },
      };
    }
  }

  if (!cdVolume) return virtualMachine;

  const virtualMachineOtherDataVolumes = (virtualMachine.spec?.dataVolumeTemplates || []).filter(
    (dv) => dv.metadata.name !== dataVolumeName,
  );

  const dataVolumeTemplates = cdDataVolumeTemplate
    ? [...virtualMachineOtherDataVolumes, cdDataVolumeTemplate]
    : virtualMachineOtherDataVolumes;

  return produceVMDisks(virtualMachine, (draftVM) => {
    ensurePath(draftVM, 'spec.template.spec.domain.devices.disks');

    draftVM.spec.dataVolumeTemplates = dataVolumeTemplates;

    if (shouldSetBootOrder) {
      draftVM.spec.template.spec.domain.devices.disks =
        draftVM.spec.template.spec.domain.devices.disks.map((disk, index) => ({
          ...disk,
          bootOrder: disk.name === cdromName ? 1 : 2 + index,
        }));
    }

    if (!getDisks(draftVM)?.find((disk) => disk.name === INSTALLATION_CDROM_NAME))
      draftVM.spec.template.spec.domain.devices.disks.push(
        createInstallationCdromDisk(draftVM.spec.template.spec.architecture),
      );

    const otherVolumes = (getVolumes(draftVM) || [])?.filter((volume) => volume.name !== cdromName);

    draftVM.spec.template.spec.volumes = [...otherVolumes, cdVolume];
  });
};

export const removeCDRomDevice = (
  virtualMachine: V1VirtualMachine,
  cdromName: string,
): V1VirtualMachine => {
  const cdVolume = getVolumes(virtualMachine)?.find((volume) => volume.name === cdromName);

  if (!cdVolume) return virtualMachine;

  return produceVMDisks(virtualMachine, (draftVM) => {
    if (cdVolume?.dataVolume?.name)
      draftVM.spec.dataVolumeTemplates = (draftVM.spec?.dataVolumeTemplates || []).filter(
        (dataVolume) => dataVolume.metadata.name !== cdVolume.dataVolume.name,
      );

    draftVM.spec.template.spec.domain.devices.disks = getDisks(draftVM).filter(
      (disk) => disk.name !== cdromName,
    );
    draftVM.spec.template.spec.volumes = getVolumes(draftVM).filter(
      (volume) => volume.name !== cdromName,
    );
  });
};

export const removeCDInstallation = (virtualMachine: V1VirtualMachine): V1VirtualMachine => {
  return removeCDRomDevice(virtualMachine, INSTALLATION_CDROM_NAME);
};

export const generateCDROMName = (): string => {
  return generatePrettyName(CDROM_DEVICE_NAME);
};

export const addCDRomDevice = (
  virtualMachine: V1VirtualMachine,
  cdromName: string,
  cdSource?: V1beta1DataVolumeSpec | V1ContainerDiskSource,
): V1VirtualMachine => {
  return addInstallationCDRom(virtualMachine, cdSource || ({} as any), cdromName, false);
};

export const addEmptyCDROMDevice = (vm: V1VirtualMachine, cdromName?: string): V1VirtualMachine => {
  const name = cdromName || generateCDROMName();
  return addCDRomDevice(vm, name);
};
