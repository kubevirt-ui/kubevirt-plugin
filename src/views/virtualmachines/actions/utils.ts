import { TFunction } from 'i18next';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { MultiNamespaceVirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import { getStorageMigrationBackend } from '@kubevirt-utils/resources/migrations/backends';
import {
  type StorageMigrationAPI,
  STORAGE_MIGRATION_API,
} from '@kubevirt-utils/resources/migrations/constants';
import { getAnnotation, getLabels, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';
import {
  escapeJsonPointerToken,
  getNoPermissionTooltipContent,
  isEmpty,
} from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { k8sDelete, Patch } from '@openshift-console/dynamic-plugin-sdk';
import { isDeletionProtectionEnabled } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { isRunning } from '@virtualmachines/utils';

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
            path: `/metadata/annotations/${escapeJsonPointerToken(originalClaimAnnotation)}`,
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
            path: `/metadata/annotations/${escapeJsonPointerToken(originalClaimAnnotation)}`,
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
    path: `/metadata/labels/${escapeJsonPointerToken(key)}`,
    value,
  }));

  const labelsPatchDelete = Object.keys(initialCommonLabels || {}).reduce((acc, key) => {
    if (!(key in newCommonLabels)) {
      acc.push({
        op: 'remove',
        path: `/metadata/labels/${escapeJsonPointerToken(key)}`,
      });
    }
    return acc;
  }, []);

  patchArray.push(...labelsPatchReplace);
  patchArray.push(...labelsPatchDelete);

  return patchArray;
};

export const isBulkDeleteActionDisabled = (vms: V1VirtualMachine[]): boolean =>
  isEmpty(vms) || vms?.some(isRunning) || vms?.some(isDeletionProtectionEnabled);

export const getBulkDeleteActionDescription = (
  vms: V1VirtualMachine[],
  t: TFunction,
): string | undefined => {
  if (vms?.some(isRunning)) {
    return t('Some VirtualMachines are running');
  }

  if (vms?.some(isDeletionProtectionEnabled)) {
    return t('Some VirtualMachines are protected');
  }

  return undefined;
};

export const moveVMToFolder = (vm: V1VirtualMachine, folderName: string) => {
  const labels = vm?.metadata?.labels || {};
  labels[VM_FOLDER_LABEL] = folderName;
  return kubevirtK8sPatch({
    data: [
      {
        op: 'replace',
        path: '/metadata/labels',
        value: labels,
      },
    ],
    model: VirtualMachineModel,
    resource: vm,
  });
};

export const getStorageMigrationConfig = (
  storageMigAPI: StorageMigrationAPI,
  referenceVM: V1VirtualMachine,
  t: TFunction,
) => {
  const isLoading = storageMigAPI === STORAGE_MIGRATION_API.LOADING;
  const isUnavailable = storageMigAPI === STORAGE_MIGRATION_API.NONE;
  const backend = getStorageMigrationBackend(storageMigAPI);
  const planModel = backend?.planModel ?? null;
  const planNamespace = backend?.fixedPlanNamespace ?? getNamespace(referenceVM);
  const accessReviewModel = planModel ?? MultiNamespaceVirtualMachineStorageMigrationPlanModel;

  const disabledTooltip = () => {
    if (isLoading) return t('Checking storage migration availability...');
    if (isUnavailable) return t('Storage migration is not available on this cluster.');
    return getNoPermissionTooltipContent(t);
  };

  return {
    accessReview: {
      cluster: getCluster(referenceVM),
      group: accessReviewModel.apiGroup,
      namespace: planModel ? planNamespace : getNamespace(referenceVM),
      resource: accessReviewModel.plural,
      verb: 'create' as const,
    },
    disabled: isLoading || isUnavailable || !planModel,
    disabledTooltip: disabledTooltip(),
  };
};
