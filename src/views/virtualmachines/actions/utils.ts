import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAnnotation, getLabels, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sDelete, Patch } from '@openshift-console/dynamic-plugin-sdk';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import { ANNOTATION_PREFIX_MIGRATION_ORIGIN_CLAIMNAME } from './constants';

export const deleteUnusedDataVolumes = (
  vm: V1VirtualMachine,
  namespace: string,
): Promise<V1beta1DataVolume>[] => {
  return getVolumes(vm).reduce((acc, volume) => {
    if (volume.dataVolume?.name) {
      acc.push(
        k8sDelete<V1beta1DataVolume>({
          model: DataVolumeModel,
          resource: {
            apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
            kind: DataVolumeModel.kind,
            metadata: {
              name: volume.dataVolume?.name,
              namespace,
            },
          } as V1beta1DataVolume,
        }),
      );
    }

    return acc;
  }, [] as Promise<V1beta1DataVolume>[]);
};

export const getMigrationClaimNameAnnotation = (migrationClaimName: string): string =>
  `${ANNOTATION_PREFIX_MIGRATION_ORIGIN_CLAIMNAME}${migrationClaimName}`;

export const createRollbackPatchData = (vm: V1VirtualMachine): Patch[] => {
  const vmVolumes = getVolumes(vm);
  const vmDataVolumeTemplates = getDataVolumeTemplates(vm);

  const dataVolumeRollback = (vmDataVolumeTemplates || []).reduce((acc, dataVolume, dvIndex) => {
    const dataVolumeName = getName(dataVolume);

    const volumeIndex = vmVolumes?.findIndex(
      (volume) => dataVolumeName === volume?.dataVolume?.name,
    );

    const originalClaimAnnotation = getMigrationClaimNameAnnotation(dataVolumeName);

    const originalClaimStorageMigration = getAnnotation(vm, originalClaimAnnotation);

    if (originalClaimStorageMigration) {
      acc.push(
        ...[
          {
            op: 'remove',
            path: `/metadata/annotations/${originalClaimAnnotation.replace('/', '~1')}`,
          },
          {
            op: 'replace',
            path: `/spec/template/spec/volumes/${volumeIndex}/dataVolume/name`,
            value: originalClaimStorageMigration,
          },
          {
            op: 'replace',
            path: `/spec/dataVolumeTemplates/${dvIndex}/metadata/name`,
            value: originalClaimStorageMigration,
          },
        ],
      );
    }

    return acc;
  }, [] as Patch[]);

  const pvcRollback = (vmVolumes || []).reduce((acc, volume, volumeIndex) => {
    const pvcName = volume.persistentVolumeClaim?.claimName;

    const originalClaimAnnotation = getMigrationClaimNameAnnotation(pvcName);

    const originalClaimStorageMigration = getAnnotation(vm, originalClaimAnnotation);

    if (originalClaimStorageMigration) {
      acc.push(
        ...[
          {
            op: 'remove',
            path: `/metadata/annotations/${originalClaimAnnotation.replace('/', '~1')}`,
          },
          {
            op: 'replace',
            path: `/spec/template/spec/volumes/${volumeIndex}/persistentVolumeClaim/claimName`,
            value: originalClaimStorageMigration,
          },
        ],
      );
    }

    return acc;
  }, [] as Patch[]);

  return [...dataVolumeRollback, ...pvcRollback];
};

export const getCommonLabels = (vms: V1VirtualMachine[]): { [key: string]: string } => {
  if (vms.length === 0) return {};

  const commonLabels = vms.reduce((acc, vm) => {
    const labels = getLabels(vm);

    if (Object.keys(acc).length === 0) {
      return { ...labels };
    }

    Object.keys(acc).forEach((key) => {
      if (labels[key] !== acc[key]) {
        delete acc[key];
      }
    });

    return acc;
  }, {});

  delete commonLabels[VM_FOLDER_LABEL];
  return commonLabels;
};

export const getLabelsDiffPatch = (
  newLabels: { [key: string]: string },
  vmLabels: { [key: string]: string },
): Patch[] => {
  const patchArray = [];

  if (isEmpty(vmLabels)) {
    patchArray.push({
      op: 'add',
      path: `/metadata/labels`,
      value: {},
    });
  }

  const labelsPatchReplace = Object.entries(newLabels || {}).map(([key, value]) => ({
    op: vmLabels?.[key] ? 'replace' : 'add',
    path: `/metadata/labels/${key?.replace('/', '~1')}`,
    value,
  }));

  const labelsPatchDelete = Object.keys(vmLabels || {}).reduce((acc, key) => {
    if (!(key in newLabels)) {
      acc.push({
        op: 'remove',
        path: `/metadata/labels/${key?.replace('/', '~1')}`,
      });
    }
    return acc;
  }, []);

  patchArray.push(...labelsPatchReplace);
  patchArray.push(...labelsPatchDelete);

  return patchArray;
};

export const isSameNamespace = (vms: V1VirtualMachine[]) => {
  if (vms.length <= 1) {
    return true;
  }

  const namespace = getNamespace(vms[0]);
  return vms.every((vm) => getNamespace(vm) === namespace);
};
