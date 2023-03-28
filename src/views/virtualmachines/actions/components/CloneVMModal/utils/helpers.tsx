import * as React from 'react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1DataVolumeTemplateSpec, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getDataVolumeTemplates,
  getDisks,
  getInterfaces,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';

export const getRandomChars = (len: number): string => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z0-9]+/g, '')
    .substr(1, len);
};

export const getClonedDisksSummary = (
  vm: V1VirtualMachine,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
) => {
  const disks = getDisks(vm);
  const volumes = getVolumes(vm);
  return disks?.map((disk) => {
    const description = [disk.name];

    const volume = (volumes || []).find((v) => v.name === disk.name);
    if (volume) {
      if (volume?.dataVolume || volume?.persistentVolumeClaim) {
        const pvc = pvcs.find(
          (p) =>
            p?.metadata?.name === volume?.persistentVolumeClaim?.claimName ||
            p?.metadata?.name === volume?.dataVolume?.name,
        );
        description.push(
          formatBytes(pvc?.spec?.resources?.requests?.storage),
          pvc?.spec?.storageClassName,
        );
      } else if (volume.containerDisk) {
        description.push('container disk');
      } else if (volume.cloudInitNoCloud) {
        description.push('cloud-init disk');
      }
    }
    return <div key={disk.name}>{description.join(' - ')}</div>;
  });
};

export const produceCleanClonedVM = (
  vm: V1VirtualMachine,
  updateClonedVM: (vmDraft: WritableDraft<V1VirtualMachine>) => void,
) => {
  return produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec']);
    ensurePath(draftVM, ['metadata']);

    if (draftVM?.metadata) {
      delete draftVM?.metadata?.resourceVersion;
      delete draftVM?.metadata?.uid;
      delete draftVM?.metadata?.creationTimestamp;
      delete draftVM?.metadata?.generation;
    }

    if (draftVM?.spec?.template?.spec?.domain) {
      delete draftVM?.spec?.template?.spec?.domain?.firmware;
    }

    delete draftVM?.status;

    (getInterfaces(draftVM) || []).forEach((iface) => {
      delete iface?.macAddress;
    });

    updateClonedVM(draftVM);
  });
};

const createDataVolumeTemplateFromPVC = (
  pvcToClone: IoK8sApiCoreV1PersistentVolumeClaim,
  dvtName: string,
): V1DataVolumeTemplateSpec => {
  return {
    apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
    kind: DataVolumeModel.kind,
    metadata: {
      name: dvtName,
    },
    spec: {
      storage: {
        accessModes: pvcToClone?.spec?.accessModes,
        volumeMode: pvcToClone?.spec?.volumeMode,
        resources: {
          requests: {
            storage: pvcToClone?.spec?.resources?.requests?.storage,
          },
        },
        storageClassName: pvcToClone?.spec?.storageClassName,
      },
      source: {
        pvc: {
          name: pvcToClone?.metadata?.name,
          namespace: pvcToClone?.metadata?.namespace,
        },
      },
    },
  };
};

export const updateClonedPersistentVolumeClaims = (
  vm: WritableDraft<V1VirtualMachine>,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): V1VirtualMachine => {
  const pvcVolumes = (getVolumes(vm) || [])?.filter((vol) => vol?.persistentVolumeClaim);
  (pvcVolumes || [])?.forEach((vol) => {
    const pvcName = vol?.persistentVolumeClaim?.claimName;
    delete vol.persistentVolumeClaim;

    const pvcToClone = pvcs?.find((pvc) => pvc.metadata.name === pvcName);
    if (pvcToClone) {
      const clonedDVTemplate = createDataVolumeTemplateFromPVC(
        pvcToClone,
        `${vm?.metadata?.name}-${vol.name}-${getRandomChars(5)}`,
      );

      vm.spec.dataVolumeTemplates = vm.spec.dataVolumeTemplates.filter(
        (dataVolume) =>
          dataVolume.metadata.name === clonedDVTemplate.metadata.name &&
          dataVolume.metadata.namespace === clonedDVTemplate.metadata.namespace,
      );

      vm.spec.dataVolumeTemplates.push(clonedDVTemplate);
      vol.dataVolume = {
        name: clonedDVTemplate?.metadata?.name,
      };
    }
  });
  return vm;
};

export const updateClonedDataVolumes = (
  vm: V1VirtualMachine,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): V1VirtualMachine => {
  const updatedDVT = (getDataVolumeTemplates(vm) || []).map((dvt) =>
    produce(dvt, (dvtDraft) => {
      dvtDraft.metadata.name = dvt.metadata.name.concat('-volume-clone');
    }),
  );

  const vmVolumes = getVolumes(vm) || [];
  const updatedVolumes = vmVolumes.map((volume) =>
    produce(volume, (draftVolume) => {
      if (volume?.dataVolume) {
        const dvName = volume.dataVolume.name;
        const cloneName = dvName.concat('-volume-clone');
        draftVolume.dataVolume.name = cloneName;

        const dataVolumeTemplate = updatedDVT.find((dvt) => dvt.metadata.name === cloneName);

        if (!dataVolumeTemplate) {
          const pvcToClone = (pvcs || []).find((pvc) => pvc?.metadata?.name === dvName);
          const newDVT = createDataVolumeTemplateFromPVC(pvcToClone, cloneName);
          updatedDVT.push(newDVT);
        }
      }
    }),
  );

  vm.spec.dataVolumeTemplates = updatedDVT;
  vm.spec.template.spec.volumes = updatedVolumes;
  return vm;
};
