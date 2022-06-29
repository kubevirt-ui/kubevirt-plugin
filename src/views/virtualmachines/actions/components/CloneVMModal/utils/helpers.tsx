import * as React from 'react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1DataVolumeTemplateSpec, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getDisks, getInterfaces, getVolumes } from '@kubevirt-utils/resources/vm';
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
    draftVM.spec.dataVolumeTemplates = [];

    (getInterfaces(draftVM) || []).forEach((iface) => {
      delete iface?.macAddress;
    });

    updateClonedVM(draftVM);
  });
};

export const updateClonedPersistentVolumeClaims = (
  vm: V1VirtualMachine,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): V1VirtualMachine => {
  const pvcVolumes = (getVolumes(vm) || [])?.filter((vol) => vol?.persistentVolumeClaim);
  (pvcVolumes || [])?.forEach((vol) => {
    const pvcName = vol?.persistentVolumeClaim?.claimName;
    delete vol.persistentVolumeClaim;

    const pvcToClone = pvcs?.find((pvc) => pvc.metadata.name === pvcName);
    if (pvcToClone) {
      const clonedDVTemplate: V1DataVolumeTemplateSpec = {
        metadata: {
          name: `${vm?.metadata?.name}-${vol.name}-${getRandomChars(5)}`,
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
              name: pvcName,
              namespace: pvcToClone?.metadata?.namespace,
            },
          },
        },
      };

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
  dataVolumes: V1beta1DataVolume[],
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): V1VirtualMachine => {
  const dvVolumes = (getVolumes(vm) || [])?.filter((vol) => vol?.dataVolume);
  (dvVolumes || [])?.forEach((vol) => {
    const dvName = vol?.dataVolume?.name;

    const dvToClone = (dataVolumes || [])?.find((dv) => dv?.metadata?.name === dvName);

    const pvcSize = pvcs
      ?.filter((pvc) => pvc?.metadata?.name === dvName)
      ?.map((pvc) => pvc?.spec?.resources?.requests?.storage)
      ?.join('');

    if (dvToClone) {
      const clonedDVTemplate: V1DataVolumeTemplateSpec = {
        apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
        kind: DataVolumeModel.kind,
        metadata: {
          name: `${vm?.metadata?.name}-${vol.name}-${getRandomChars(5)}`,
          namespace: vm?.metadata?.namespace,
        },
        spec: {
          storage: {
            accessModes: dvToClone?.spec?.storage?.accessModes || dvToClone?.spec?.pvc?.accessModes,
            volumeMode: dvToClone?.spec?.storage?.volumeMode || dvToClone?.spec?.pvc?.volumeMode,
            resources: {
              requests: {
                storage:
                  pvcSize ||
                  dvToClone?.spec?.storage?.resources?.requests?.storage ||
                  dvToClone?.spec?.pvc?.resources?.requests?.storage,
              },
            },
            storageClassName:
              dvToClone?.spec?.storage?.storageClassName || dvToClone?.spec?.pvc?.storageClassName,
          },
          source: {
            pvc: {
              name: dvName,
              namespace: dvToClone?.metadata?.namespace,
            },
          },
        },
      };

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
