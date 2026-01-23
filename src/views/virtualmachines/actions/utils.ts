import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ToastService } from '@kubevirt-utils/hooks/useToastNotifications/toastNotificationsSignals';
import { getAnnotation, getLabels, getName } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sDelete, Patch } from '@openshift-console/dynamic-plugin-sdk';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import { ANNOTATION_PREFIX_MIGRATION_ORIGIN_CLAIMNAME } from './constants';

type Labels = { [key: string]: string };

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

export const getCommonLabels = (vms: V1VirtualMachine[]): Labels => {
  if (vms.length === 0) return {};

  const commonLabels = vms.reduce<Labels>((common, vm, index) => {
    const currentVMLabels = getLabels(vm, {});

    if (index === 0) {
      return currentVMLabels;
    }

    const intersection: Labels = {};
    Object.keys(common).forEach((key) => {
      if (currentVMLabels[key] === common[key]) {
        intersection[key] = common[key];
      }
    });

    return intersection;
  }, {});

  const { [VM_FOLDER_LABEL]: _, ...commonLabelsWithoutFolder } = commonLabels;
  return commonLabelsWithoutFolder;
};

export const getLabelsDiffPatch = (
  newCommonLabels: Labels,
  initialCommonLabels: Labels,
  initialVMLabels: Labels,
): Patch[] => {
  const patchArray = [];

  if (isEmpty(initialVMLabels)) {
    patchArray.push({
      op: 'add',
      path: `/metadata/labels`,
      value: {},
    });
  }

  const labelsPatchReplace = Object.entries(newCommonLabels || {}).map(([key, value]) => ({
    op: initialCommonLabels?.[key] ? 'replace' : 'add',
    path: `/metadata/labels/${key?.replace('/', '~1')}`,
    value,
  }));

  const labelsPatchDelete = Object.keys(initialCommonLabels || {}).reduce((acc, key) => {
    if (!(key in newCommonLabels)) {
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

/**
 * Wraps a VM action function with error handling and toast notifications.
 * This function automatically shows error toasts when actions fail.
 *
 * @param action - The VM action function to wrap (e.g., startVM, stopVM)
 * @returns A promise that resolves when the action succeeds, or create a toast with the error
 */
export const wrapVMActionWithToast = <T>(action: () => Promise<T>): (() => Promise<T | void>) => {
  return async (): Promise<T | void> => {
    try {
      return await action();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error) || 'Unknown error occurred';

      ToastService.warning(errorMessage);
      kubevirtConsole.error(error);
    }
  };
};
