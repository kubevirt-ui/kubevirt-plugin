import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1beta1StorageSpec,
  V1DataVolumeTemplateSpec,
  V1Disk,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  AddBootableVolumeState,
  emptyDataSource,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { createPVCBootableVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import {
  DEFAULT_CDROM_DISK_SIZE,
  UPLOAD_SUFFIX,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import { InterfaceTypes, V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getDataVolumeTemplates,
  getDisks,
  getPreferenceMatcher,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getVMIDevices } from '@kubevirt-utils/resources/vmi';
import { ARCHITECTURE_LABEL } from '@kubevirt-utils/utils/architecture';
import { ensurePath, generatePrettyName, isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

const UPLOAD_MODE_SELECT = 'select';
const UPLOAD_MODE_UPLOAD = 'upload';

const getBootableVolumeDraft = (
  diskObj: DiskRowDataLayout,
  vm: V1VirtualMachine,
  bootableVolumeSource: AddBootableVolumeState,
  architecture?: string,
) => {
  const hasSelectedArchitecture = !isEmpty(architecture);
  const { bootableVolumeName, bootableVolumeNamespace, labels } = bootableVolumeSource ?? {};
  const dataSource = produce(emptyDataSource, (draftDataSource) => {
    draftDataSource.metadata.name = hasSelectedArchitecture
      ? `${bootableVolumeName}-${architecture}`
      : bootableVolumeName;
    draftDataSource.metadata.namespace = bootableVolumeNamespace;

    draftDataSource.metadata.labels = {
      [DEFAULT_PREFERENCE_LABEL]: getPreferenceMatcher(vm)?.name,
      ...(hasSelectedArchitecture ? { [ARCHITECTURE_LABEL]: architecture } : {}),
      ...(labels || {}),
    };
  });

  return createPVCBootableVolume(bootableVolumeSource, diskObj?.namespace, dataSource);
};

export const createBootableVolumeFromDisk = async (
  diskObj: DiskRowDataLayout,
  vm: V1VirtualMachine,
  bootableVolumeSource: AddBootableVolumeState,
) => {
  const architectures = bootableVolumeSource?.architectures;
  if (isEmpty(architectures)) {
    return getBootableVolumeDraft(diskObj, vm, bootableVolumeSource);
  }

  const bootableVolumes = await Promise.all(
    architectures.map((architecture) =>
      getBootableVolumeDraft(diskObj, vm, bootableVolumeSource, architecture),
    ),
  );

  // return the first bootable volume to navigate to (arbitrarily chosen)
  return bootableVolumes?.[0];
};

const addDiskToVM = (draftVM: WritableDraft<V1VirtualMachine>, diskToPersist: V1Disk) => {
  const disks = getDisks(draftVM) || [];

  if (isEmpty(diskToPersist) || disks.find((disk) => disk.name === diskToPersist.name)) return;

  disks.push({ ...diskToPersist, serial: null });

  draftVM.spec.template.spec.domain.devices.disks = disks;
};

const addDataVolumeToVM = async (
  draftVM: WritableDraft<V1VirtualMachine>,
  dataVolumeName: string,
) => {
  const dataVolumeTemplates = getDataVolumeTemplates(draftVM);

  if (dataVolumeTemplates.find((dataVolume) => dataVolume.metadata.name === dataVolumeName)) return;

  const originDataVolume = await kubevirtK8sGet<V1beta1DataVolume>({
    cluster: getCluster(draftVM),
    model: DataVolumeModel,
    name: dataVolumeName,
    ns: getNamespace(draftVM),
  });

  dataVolumeTemplates.push({
    metadata: {
      name: dataVolumeName,
    },
    spec: {
      source: {
        pvc: {
          name: dataVolumeName,
          namespace: getNamespace(draftVM),
        },
      },
      storage: originDataVolume?.spec?.storage as V1beta1StorageSpec,
    },
  });
};

const removeHotplugFromVolume = (volume: V1Volume) =>
  produce(volume, (draftVolume) => {
    if (draftVolume?.dataVolume?.hotpluggable) delete draftVolume.dataVolume.hotpluggable;

    if (draftVolume?.persistentVolumeClaim?.hotpluggable)
      delete draftVolume.persistentVolumeClaim.hotpluggable;
  });

export const persistVolume = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  volumeToPersist: V1Volume,
) =>
  produce(vm, async (draftVM) => {
    ensurePath(draftVM, 'spec.template.spec.domain.devices');

    const vmVolumes = getVolumes(draftVM);

    const vmVolumeToPersist = vmVolumes.find((vmVolume) => vmVolume.name === volumeToPersist?.name);

    if (vmVolumeToPersist) {
      draftVM.spec.template.spec.volumes = [
        ...vmVolumes.filter((volume) => volume.name !== vmVolumeToPersist.name),
        removeHotplugFromVolume(vmVolumeToPersist),
      ];
    }

    if (!vmVolumeToPersist) {
      vmVolumes.push(removeHotplugFromVolume(volumeToPersist));
    }

    const diskToPersist = getVMIDevices(vmi)?.disks?.find(
      (disk) => disk.name === volumeToPersist.name,
    );

    addDiskToVM(draftVM, diskToPersist);

    if (!isEmpty(volumeToPersist?.dataVolume?.name))
      await addDataVolumeToVM(draftVM, volumeToPersist?.dataVolume?.name);

    return draftVM;
  });

export const buildDiskState = (
  uploadMode: string,
  selectedISO: string,
  uploadFile: File | null,
  vm: V1VirtualMachine,
  cdromName: string,
  uploadFilename: string,
): null | V1DiskFormState => {
  if (uploadMode === UPLOAD_MODE_UPLOAD && uploadFile) {
    return buildUploadDiskState(vm, cdromName, uploadFile, uploadFilename);
  }

  if (uploadMode === UPLOAD_MODE_SELECT && selectedISO) {
    return buildSelectDiskState(cdromName, selectedISO);
  }

  return null;
};

const buildUploadDiskState = (
  vm: V1VirtualMachine,
  cdromName: string,
  uploadFile: File,
  uploadFilename: string,
): V1DiskFormState => {
  const vmNamespace = getNamespace(vm);
  const uploadDataVolumeName = `${cdromName}-${generatePrettyName(UPLOAD_SUFFIX)}`;

  return {
    dataVolumeTemplate: {
      metadata: {
        name: uploadDataVolumeName,
        namespace: vmNamespace,
      },
      spec: {
        source: {
          upload: {},
        },
        storage: {
          resources: {
            requests: {
              storage: DEFAULT_CDROM_DISK_SIZE,
            },
          },
        },
      },
    },
    disk: {
      cdrom: { bus: InterfaceTypes.SATA },
      name: cdromName,
    },
    isBootSource: false,
    uploadFile: {
      file: uploadFile,
      filename: uploadFilename,
    },
    volume: {
      dataVolume: {
        name: uploadDataVolumeName,
      },
      name: cdromName,
    },
  };
};

const buildSelectDiskState = (cdromName: string, selectedISO: string): V1DiskFormState => {
  return {
    disk: {
      cdrom: { bus: InterfaceTypes.SATA },
      name: cdromName,
    },
    isBootSource: false,
    volume: {
      name: cdromName,
      persistentVolumeClaim: {
        claimName: selectedISO,
      },
    },
  };
};

export const convertDataVolumeToTemplate = (
  dataVolume: V1beta1DataVolume,
): V1DataVolumeTemplateSpec => ({
  metadata: dataVolume.metadata,
  spec: {
    source: dataVolume.spec.source,
    storage: {
      accessModes: dataVolume.spec.storage?.accessModes?.map((mode) => mode as any),
      resources: dataVolume.spec.storage?.resources,
    },
  },
});
