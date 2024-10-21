import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataVolume,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { MAX_NAME_LENGTH } from '@kubevirt-utils/components/SSHSecretModal/utils/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sDelete, k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';

const getBlankDataVolume = (
  originName: string,
  namespace: string,
  storageClassName: string,
  storage: string,
): V1beta1DataVolume => {
  const randomChars = getRandomChars();
  const namePrefix = `clone-${originName}`.substring(0, MAX_NAME_LENGTH - 6 - randomChars.length);

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
        accessModes: ['ReadWriteMany'],
        resources: {
          requests: {
            storage,
          },
        },
        storageClassName,
        volumeMode: V1beta1StorageSpecVolumeModeEnum.Block,
      },
    },
  };
};

const createBlankDataVolumes = async (
  originPVCs: IoK8sApiCoreV1PersistentVolumeClaim[],
  destinationStorageClass: string,
): Promise<Map<string, V1beta1DataVolume>> => {
  const dataVolumesCreationResults = await Promise.allSettled(
    originPVCs
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

  return originPVCs.reduce((createdDataVolumeByPVCName, pvc, index) => {
    createdDataVolumeByPVCName.set(getName(pvc), dataVolumesCreated[index]);
    return createdDataVolumeByPVCName;
  }, new Map<string, V1beta1DataVolume>());
};

const createPatchData = (
  vm: V1VirtualMachine,
  createdDataVolumeByPVCName: Map<string, V1beta1DataVolume>,
) =>
  getVolumes(vm).reduce((patchArray, volume, volumeIndex) => {
    if (volume?.persistentVolumeClaim?.claimName) {
      patchArray.push({
        op: 'replace',
        path: `/spec/template/spec/volumes/${volumeIndex}/persistentVolumeClaim/claimName`,
        value: getName(createdDataVolumeByPVCName.get(volume?.persistentVolumeClaim?.claimName)),
      });
    }

    if (volume?.dataVolume?.name) {
      const destinationDataVolumeName = getName(
        createdDataVolumeByPVCName.get(volume?.dataVolume?.name),
      );

      const dataVolumeIndex = getDataVolumeTemplates(vm)?.findIndex(
        (dataVolumeTemplate) => getName(dataVolumeTemplate) === volume?.dataVolume?.name,
      );

      patchArray.push({
        op: 'replace',
        path: `/spec/template/spec/volumes/${volumeIndex}/dataVolume/name`,
        value: destinationDataVolumeName,
      });

      patchArray.push({
        op: 'replace',
        path: `/spec/dataVolumeTemplates/${dataVolumeIndex}/metadata/name`,
        value: destinationDataVolumeName,
      });
    }
    return patchArray;
  }, [] as Patch[]);

export const migrateVM = async (
  vm: V1VirtualMachine,
  originPVCs: IoK8sApiCoreV1PersistentVolumeClaim[],
  destinationStorageClass: string,
) => {
  const createdDataVolumeByPVCName = await createBlankDataVolumes(
    originPVCs,
    destinationStorageClass,
  );

  const patchData = createPatchData(vm, createdDataVolumeByPVCName);

  patchData.push({
    op: 'add',
    path: '/spec/updateVolumesStrategy',
    value: 'migration',
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
