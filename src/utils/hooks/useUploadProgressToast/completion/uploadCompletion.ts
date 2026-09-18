import { type TFunction } from 'i18next';

import { DataVolumeModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isK8sNotFoundError } from '@kubevirt-utils/resources/errorStatusChecks';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { useUploadProgressStore } from '../uploadProgressStore';

import { getBootableVolumeSuccessLink, getVmDiskUploadSuccessLinks } from './uploadLinks';

type CompleteVmDiskUploadParams = {
  dataVolumeName: string;
  diskName: string;
  expectedGeneration?: number;
  t: TFunction;
  uploadKey: string;
  vm: V1VirtualMachine;
};

type CompleteBootableVolumeUploadParams = {
  dataSource: V1beta1DataSource;
  expectedGeneration?: number;
  t: TFunction;
  uploadKey: string;
};

const asDeletedVm = (vm: V1VirtualMachine): V1VirtualMachine => ({
  ...vm,
  metadata: {
    ...vm.metadata,
    deletionTimestamp: vm.metadata?.deletionTimestamp ?? new Date().toISOString(),
    uid: undefined,
  },
});

const resolveVmForSuccessLinks = async (vm: V1VirtualMachine): Promise<V1VirtualMachine> => {
  if (!getUID(vm)) {
    return vm;
  }
  try {
    const fetchedVm = await kubevirtK8sGet<V1VirtualMachine>({
      cluster: getCluster(vm),
      model: VirtualMachineModel,
      name: getName(vm),
      ns: getNamespace(vm),
    });
    return getUID(fetchedVm) === getUID(vm) ? fetchedVm : asDeletedVm(vm);
  } catch (error) {
    if (isK8sNotFoundError(error)) {
      return asDeletedVm(vm);
    }
    return vm;
  }
};

const isDataVolumeAlive = async (
  dataVolumeName: string,
  namespace: string,
  cluster?: string,
): Promise<boolean> => {
  if (!dataVolumeName || !namespace) {
    return false;
  }
  try {
    const dataVolume = await kubevirtK8sGet({
      cluster,
      model: DataVolumeModel,
      name: dataVolumeName,
      ns: namespace,
    });
    return Boolean(dataVolume && !dataVolume.metadata?.deletionTimestamp);
  } catch (error) {
    return !isK8sNotFoundError(error);
  }
};

const completeVmStorageUpload = async ({
  dataVolumeName,
  diskName,
  expectedGeneration,
  isCdrom = false,
  t,
  uploadKey,
  vm,
}: CompleteVmDiskUploadParams & { isCdrom?: boolean }): Promise<void> => {
  const current = useUploadProgressStore.getState().getUpload(uploadKey);
  if (
    current?.status !== UPLOAD_PROGRESS_STATUS.UPLOADING ||
    (expectedGeneration !== undefined && current.generation !== expectedGeneration)
  ) {
    return;
  }

  const [vmForLinks, dataVolumeAlive] = await Promise.all([
    resolveVmForSuccessLinks(vm),
    isCdrom
      ? Promise.resolve(false)
      : isDataVolumeAlive(dataVolumeName, getNamespace(vm), getCluster(vm)),
  ]);

  useUploadProgressStore.getState().completeUpload(uploadKey, {
    expectedGeneration: expectedGeneration ?? current.generation,
    resourceName: diskName,
    successLinks: getVmDiskUploadSuccessLinks(
      t,
      vmForLinks,
      diskName,
      dataVolumeName,
      isCdrom,
      dataVolumeAlive,
    ),
  });
};

export const completeVmDiskUpload = (params: CompleteVmDiskUploadParams): Promise<void> =>
  completeVmStorageUpload(params);

export const completeVmCdromUpload = (params: CompleteVmDiskUploadParams): Promise<void> =>
  completeVmStorageUpload({ ...params, isCdrom: true });

export const completeBootableVolumeUpload = ({
  dataSource,
  expectedGeneration,
  t,
  uploadKey,
}: CompleteBootableVolumeUploadParams): void => {
  const volumeName = getName(dataSource) ?? '';

  useUploadProgressStore.getState().completeUpload(uploadKey, {
    expectedGeneration,
    resourceName: volumeName,
    successLinks: [
      getBootableVolumeSuccessLink(t, volumeName, getNamespace(dataSource), getCluster(dataSource)),
    ],
  });
};

export const failBootableVolumeUpload = (
  uploadKey: string,
  error: unknown,
  expectedGeneration?: number,
): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  useUploadProgressStore.getState().failUpload(uploadKey, errorMessage, expectedGeneration);
};
