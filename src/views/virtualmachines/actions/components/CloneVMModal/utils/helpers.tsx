import * as React from 'react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import ControllerRevisionModel from '@kubevirt-ui/kubevirt-api/console/models/ControllerRevisionModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  IoK8sApiAppsV1ControllerRevision,
  IoK8sApiCoreV1PersistentVolumeClaim,
} from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1DataVolumeTemplateSpec, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { buildOwnerReference, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getDataVolumeTemplates,
  getDisks,
  getInterfaces,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sGet, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

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
      source: {
        pvc: {
          name: pvcToClone?.metadata?.name,
          namespace: pvcToClone?.metadata?.namespace,
        },
      },
      storage: {
        accessModes: pvcToClone?.spec?.accessModes,
        resources: {
          requests: {
            storage: pvcToClone?.spec?.resources?.requests?.storage,
          },
        },
        storageClassName: pvcToClone?.spec?.storageClassName,
        volumeMode: pvcToClone?.spec?.volumeMode,
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

    const pvcToClone = pvcs?.find((pvc) => getName(pvc) === pvcName);
    if (pvcToClone) {
      const clonedDVTemplate = createDataVolumeTemplateFromPVC(
        pvcToClone,
        `${getName(vm)}-${vol.name}-${getRandomChars(5)}`,
      );

      const dataVolumeTemplates = [...getDataVolumeTemplates(vm)];

      if (!isEmpty(dataVolumeTemplates)) {
        vm.spec.dataVolumeTemplates = dataVolumeTemplates.filter(
          (dataVolume) =>
            getName(dataVolume) === getName(clonedDVTemplate) &&
            getNamespace(dataVolume) === getNamespace(clonedDVTemplate),
        );
      } else {
        vm.spec.dataVolumeTemplates = [];
      }

      vm.spec.dataVolumeTemplates.push(clonedDVTemplate);
      vol.dataVolume = {
        name: getName(clonedDVTemplate),
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

const getControllerIfExist = async (name: string, ns: string) => {
  try {
    return await k8sGet<IoK8sApiAppsV1ControllerRevision>({
      model: ControllerRevisionModel,
      name,
      ns,
    });
  } catch (error) {
    if (error.code !== 404) {
      throw error;
    }

    return null;
  }
};

export const cloneControllerRevision = async (
  revisionName: string,
  destinationNamespace: string,
  originNamespace: string,
): Promise<IoK8sApiAppsV1ControllerRevision | null> => {
  if (!revisionName) return null;

  const destNamespaceCR = await getControllerIfExist(revisionName, destinationNamespace);

  if (destNamespaceCR) return destNamespaceCR;

  const controllerRevision = await k8sGet<IoK8sApiAppsV1ControllerRevision>({
    model: ControllerRevisionModel,
    name: revisionName,
    ns: originNamespace,
  });

  const controllerRevisionClone = produce(controllerRevision, (draftController) => {
    draftController.metadata.namespace = destinationNamespace;

    delete draftController.metadata.resourceVersion;
    delete draftController.metadata.uid;
    delete draftController.metadata.ownerReferences;
  });

  return await k8sCreate<IoK8sApiAppsV1ControllerRevision>({
    data: controllerRevisionClone,
    model: ControllerRevisionModel,
  });
};

export const updateControllerRevisionOwnerReference = (
  controllerRevision: IoK8sApiAppsV1ControllerRevision,
  vm: V1VirtualMachine,
): Promise<IoK8sApiAppsV1ControllerRevision | null> => {
  if (!controllerRevision) return Promise.resolve(null);

  const controllerRevisionWithOwner = produce(controllerRevision, (draftController) => {
    if (!draftController.metadata.ownerReferences) draftController.metadata.ownerReferences = [];

    draftController.metadata.ownerReferences.push(
      buildOwnerReference(vm, { blockOwnerDeletion: false }),
    );
  });

  return k8sUpdate<IoK8sApiAppsV1ControllerRevision>({
    data: controllerRevisionWithOwner,
    model: ControllerRevisionModel,
    name: controllerRevisionWithOwner?.metadata?.name,
    ns: controllerRevisionWithOwner?.metadata?.namespace,
  });
};
