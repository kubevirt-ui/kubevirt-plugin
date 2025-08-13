import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';
import { UPDATE_STRATEGIES } from '@kubevirt-utils/resources/vm/utils/constants';
import { getStorageClassName } from '@kubevirt-utils/resources/vm/utils/dataVolumeTemplate/selectors';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { MAX_K8S_NAME_LENGTH } from '@kubevirt-utils/utils/constants';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sDelete, k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';
import { getMigrationClaimNameAnnotation } from '@virtualmachines/actions/utils';

const getBlankDataVolume = (
  dataVolumeName: string,
  namespace: string,
  storageClassName: string,
  storage: string,
): V1beta1DataVolume => {
  const randomChars = getRandomChars();

  const originName = dataVolumeName.replace(/-mig-[\d\w]+$/, '');
  const namePrefix = `${originName}-mig`.substring(0, MAX_K8S_NAME_LENGTH - 5 - randomChars.length);

  return {
    apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
    kind: DataVolumeModel.kind,
    metadata: {
      name: `${namePrefix}-${randomChars}`,
      namespace,
    },
    spec: {
      source: {
        blank: {},
      },
      storage: {
        resources: {
          requests: {
            storage,
          },
        },
        storageClassName,
      },
    },
  };
};

const createBlankDataVolumes = async (
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[],
  destinationStorageClass: string,
): Promise<Map<string, V1beta1DataVolume>> => {
  const dataVolumesCreationResults = await Promise.allSettled(
    selectedPVCs
      .map((pvc) => {
        return getBlankDataVolume(
          getName(pvc),
          getNamespace(pvc),
          destinationStorageClass,
          pvc?.spec?.resources?.requests?.storage,
        );
      })
      .map((dataVolume) =>
        k8sCreate({ data: dataVolume, model: DataVolumeModel, ns: getNamespace(dataVolume) }),
      ),
  );

  const { fulfilledRequests, rejectedRequests } = dataVolumesCreationResults.reduce(
    (acc, result) => {
      result.status === 'rejected'
        ? acc.rejectedRequests.push(result)
        : acc.fulfilledRequests.push(result);

      return acc;
    },
    {
      fulfilledRequests: [] as PromiseFulfilledResult<V1beta1DataVolume>[],
      rejectedRequests: [] as PromiseRejectedResult[],
    },
  );

  if (!isEmpty(rejectedRequests)) {
    fulfilledRequests.map((result) =>
      k8sDelete({
        model: DataVolumeModel,
        resource: result.value,
      }),
    );

    throw new Error(rejectedRequests?.[0].reason);
  }

  const dataVolumesCreated = fulfilledRequests.map((result) => result.value);

  return selectedPVCs.reduce((createdDataVolumeByPVCName, pvc, index) => {
    createdDataVolumeByPVCName.set(getName(pvc), dataVolumesCreated[index]);
    return createdDataVolumeByPVCName;
  }, new Map<string, V1beta1DataVolume>());
};

const createPatchData = (
  vm: V1VirtualMachine,
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[],
  createdDataVolumeByPVCName: Map<string, V1beta1DataVolume>,
) =>
  getVolumes(vm).reduce((patchArray, volume, volumeIndex) => {
    const pvcName = volume?.persistentVolumeClaim?.claimName || volume?.dataVolume?.name;
    const pvc = selectedPVCs.find((selectedPVC) => getName(selectedPVC) === pvcName);

    if (isEmpty(pvc)) return patchArray;

    const destination = createdDataVolumeByPVCName.get(pvcName);

    const destinationName = getName(destination);

    const migrationClaimNameAnnotation = getMigrationClaimNameAnnotation(destinationName);

    patchArray.push({
      op: 'add',
      path: `/metadata/annotations/${migrationClaimNameAnnotation.replace('/', '~1')}`,
      value: pvcName,
    });

    if (volume?.persistentVolumeClaim?.claimName) {
      patchArray.push({
        op: 'replace',
        path: `/spec/template/spec/volumes/${volumeIndex}/persistentVolumeClaim/claimName`,
        value: destinationName,
      });
    }

    if (volume?.dataVolume?.name) {
      const dataVolumeIndex = getDataVolumeTemplates(vm)?.findIndex(
        (dataVolumeTemplate) => getName(dataVolumeTemplate) === volume?.dataVolume?.name,
      );

      patchArray.push({
        op: 'replace',
        path: `/spec/template/spec/volumes/${volumeIndex}/dataVolume/name`,
        value: destinationName,
      });

      patchArray.push({
        op: 'replace',
        path: `/spec/dataVolumeTemplates/${dataVolumeIndex}/metadata/name`,
        value: destinationName,
      });

      const storageClassname = getStorageClassName(destination);

      if (storageClassname)
        patchArray.push({
          op: 'replace',
          path: `/spec/dataVolumeTemplates/${dataVolumeIndex}/spec/storage/storageClassName`,
          value: storageClassname,
        });
    }
    return patchArray;
  }, [] as Patch[]);

export const migrateVM = async (
  vm: V1VirtualMachine,
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[],
  destinationStorageClass: string,
) => {
  const createdDataVolumeByPVCName = await createBlankDataVolumes(
    selectedPVCs,
    destinationStorageClass,
  );

  const patchData = createPatchData(vm, selectedPVCs, createdDataVolumeByPVCName);

  patchData.push({
    op: 'add',
    path: '/spec/updateVolumesStrategy',
    value: UPDATE_STRATEGIES.Migration,
  });

  try {
    return k8sPatch({
      data: patchData,
      model: VirtualMachineModel,
      resource: vm,
    });
  } catch (error) {
    createdDataVolumeByPVCName.forEach((dataVolume) =>
      k8sDelete({
        model: DataVolumeModel,
        resource: dataVolume,
      }),
    );

    throw error;
  }
};

export const entireVMSelected = (selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[]) =>
  selectedPVCs === null;

export const getVolumeFromPVC = (
  volumes: V1Volume[],
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): V1Volume[] => {
  const pvcNames = pvcs.map((pvc) => getName(pvc));

  return volumes.filter(
    (volume) =>
      pvcNames.includes(volume?.persistentVolumeClaim?.claimName) ||
      pvcNames.includes(volume?.dataVolume?.name),
  );
};

export const getMigrationSuccessTimestamp = (vmim: V1VirtualMachineInstanceMigration): string =>
  vmim?.status?.phaseTransitionTimestamps?.find(
    (phaseTransition) => phaseTransition.phase === vmimStatuses.Succeeded,
  )?.phaseTransitionTimestamp;

export const getMigrationStatusLabel = (vmim: V1VirtualMachineInstanceMigration): string => {
  if (vmim?.status?.phase === vmimStatuses.Failed) return t('Failed');
  if (vmimStatuses.Succeeded === vmim?.status?.phase) return t('Migration completed successfully');

  return t('In progress');
};
