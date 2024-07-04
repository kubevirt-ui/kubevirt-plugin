import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import {
  V1beta1DataVolumeSpec,
  V1ContainerDiskSource,
  V1DataVolumeTemplateSpec,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { ensurePath, removeDockerPrefix } from '@kubevirt-utils/utils/utils';

import { INSTALLATION_CDROM_DISK, INSTALLATION_CDROM_NAME } from './constants';

export const addInstallationCDRom = (
  virtualMachine: V1VirtualMachine,
  cdSource: V1beta1DataVolumeSpec | V1ContainerDiskSource,
): V1VirtualMachine => {
  let cdVolume: V1Volume = undefined;
  let cdDataVolumeTemplate: V1DataVolumeTemplateSpec = undefined;
  const dataVolumeName = `${virtualMachine?.metadata?.name}-${INSTALLATION_CDROM_NAME}`;

  if ('image' in cdSource) {
    cdVolume = {
      containerDisk: {
        image: removeDockerPrefix((cdSource as V1ContainerDiskSource).image),
      },
      name: INSTALLATION_CDROM_NAME,
    };
  }

  const cdDataVolumeSource = (cdSource as V1beta1DataVolumeSpec)?.source;

  if (cdDataVolumeSource?.registry) {
    cdVolume = {
      containerDisk: {
        image: removeDockerPrefix(cdDataVolumeSource?.registry.url),
      },
      name: INSTALLATION_CDROM_NAME,
    };
  } else if (cdDataVolumeSource?.http || cdDataVolumeSource?.pvc || cdDataVolumeSource?.upload) {
    cdVolume = {
      dataVolume: {
        name: dataVolumeName,
      },
      name: INSTALLATION_CDROM_NAME,
    };

    cdDataVolumeTemplate = {
      metadata: { name: dataVolumeName },
      spec: { source: cdDataVolumeSource, storage: (cdSource as V1beta1DataVolumeSpec)?.storage },
    };
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
    draftVM.spec.template.spec.domain.devices.disks =
      draftVM.spec.template.spec.domain.devices.disks.map((disk, index) => ({
        ...disk,
        bootOrder: disk.name === INSTALLATION_CDROM_NAME ? 1 : 2 + index,
      }));

    if (!getDisks(draftVM)?.find((disk) => disk.name === INSTALLATION_CDROM_NAME))
      draftVM.spec.template.spec.domain.devices.disks.push(INSTALLATION_CDROM_DISK);

    const otherVolumes = (getVolumes(draftVM) || [])?.filter(
      (volume) => volume.name !== INSTALLATION_CDROM_NAME,
    );

    draftVM.spec.template.spec.volumes = [...otherVolumes, cdVolume];
  });
};

export const removeCDInstallation = (virtualMachine: V1VirtualMachine): V1VirtualMachine => {
  const cdVolume = getVolumes(virtualMachine)?.find(
    (volume) => volume.name === INSTALLATION_CDROM_NAME,
  );

  if (!cdVolume) return virtualMachine;

  return produceVMDisks(virtualMachine, (draftVM) => {
    if (cdVolume?.dataVolume?.name)
      draftVM.spec.dataVolumeTemplates = (draftVM.spec?.dataVolumeTemplates || []).filter(
        (dataVolume) => dataVolume.metadata.name !== cdVolume.dataVolume.name,
      );

    draftVM.spec.template.spec.domain.devices.disks = getDisks(draftVM).filter(
      (disk) => disk.name !== INSTALLATION_CDROM_NAME,
    );
    draftVM.spec.template.spec.volumes = getVolumes(draftVM).filter(
      (volume) => volume.name !== INSTALLATION_CDROM_NAME,
    );
    draftVM.spec.template.spec.volumes.push(cdVolume);
  });
};
