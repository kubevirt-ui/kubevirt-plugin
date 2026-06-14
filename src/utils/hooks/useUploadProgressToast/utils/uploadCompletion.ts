import { TFunction } from 'i18next';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { appendBootableVolumeContext } from '@kubevirt-utils/resources/bootableresources/constants';
import { getName, getResourceUrl } from '@kubevirt-utils/resources/shared';

import { useUploadProgressStore } from '../uploadProgressStore';

import { getVmDiskUploadSuccessLinks } from './uploadLinks';

type CompleteVmDiskUploadParams = {
  dataVolumeName: string;
  diskName: string;
  t: TFunction;
  uploadKey: string;
  vm: V1VirtualMachine;
};

type CompleteVmCdromUploadParams = CompleteVmDiskUploadParams;

type CompleteBootableVolumeUploadParams = {
  dataSource: V1beta1DataSource;
  t: TFunction;
  uploadKey: string;
};

export const completeVmDiskUpload = ({
  dataVolumeName,
  diskName,
  t,
  uploadKey,
  vm,
}: CompleteVmDiskUploadParams): void => {
  useUploadProgressStore.getState().completeUpload(uploadKey, {
    resourceName: diskName,
    successLinks: getVmDiskUploadSuccessLinks(t, vm, diskName, dataVolumeName),
  });
};

export const completeVmCdromUpload = ({
  dataVolumeName,
  diskName,
  t,
  uploadKey,
  vm,
}: CompleteVmCdromUploadParams): void => {
  useUploadProgressStore.getState().completeUpload(uploadKey, {
    resourceName: diskName,
    successLinks: getVmDiskUploadSuccessLinks(t, vm, diskName, dataVolumeName, true),
  });
};

export const completeBootableVolumeUpload = ({
  dataSource,
  t,
  uploadKey,
}: CompleteBootableVolumeUploadParams): void => {
  const volumeName = getName(dataSource);
  const volumeUrl = appendBootableVolumeContext(
    getResourceUrl({ model: DataSourceModel, resource: dataSource }),
  );

  useUploadProgressStore.getState().completeUpload(uploadKey, {
    resourceName: volumeName,
    successLinks: [
      {
        label: t('View bootable volume {{name}}', { name: volumeName }),
        url: volumeUrl,
      },
    ],
  });
};

export const failBootableVolumeUpload = (uploadKey: string, error: unknown): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  useUploadProgressStore.getState().failUpload(uploadKey, errorMessage);
};
