import type { TFunction } from 'i18next';

import type { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import type { DataVolumeSpecFields } from '@kubevirt-utils/components/AddBootableVolumeModal/bootableVolumeSources/dataVolumeHelpers';
import type { TLSCertSourceType } from '@kubevirt-utils/components/TLSCertificateSection';
import type { CdiUploadDataFn } from '@kubevirt-utils/hooks/useCDIUpload/types';

import type { BootableVolumeWizardFormValues } from '../form/types';

export type CommonCreateParams = {
  cluster?: string;
  dataVolume: DataVolumeSpecFields;
  draftDataSource: V1beta1DataSource;
  namespace: string;
};

export const createUploadParams = (
  values: BootableVolumeWizardFormValues,
  common: CommonCreateParams,
  extras: {
    onUploadStart?: (uploadKey: string) => void;
    t: TFunction;
    uploadData: CdiUploadDataFn;
  },
): CommonCreateParams & {
  onUploadStart?: (uploadKey: string) => void;
  t: TFunction;
  uploadData: CdiUploadDataFn;
  uploadFile: File | string;
} => ({
  ...common,
  ...extras,
  uploadFile: values.imageSource.upload.file,
});

export const createPVCParams = (
  values: BootableVolumeWizardFormValues,
  common: CommonCreateParams,
): CommonCreateParams & { pvcName: string; pvcNamespace: string } => ({
  ...common,
  pvcName: values.imageSource.existingVolume.name,
  pvcNamespace: values.imageSource.existingVolume.project,
});

export const createHTTPParams = (
  values: BootableVolumeWizardFormValues,
  common: CommonCreateParams,
): CommonCreateParams & {
  tlsCertConfigMapName?: string;
  tlsCertificate?: string;
  tlsCertificateRequired?: boolean;
  tlsCertProject?: string;
  tlsCertSource: TLSCertSourceType | undefined;
  url: string;
} => {
  const { url: urlConfig } = values.imageSource;
  return {
    ...common,
    tlsCertConfigMapName: urlConfig.configMapName,
    tlsCertificate: urlConfig.certificate,
    tlsCertificateRequired: urlConfig.tlsCertificateRequired,
    tlsCertProject: urlConfig.project,
    tlsCertSource: urlConfig.certificateSource as TLSCertSourceType | undefined,
    url: urlConfig.imageUrl,
  };
};

export const createRegistryParams = (
  values: BootableVolumeWizardFormValues,
  common: CommonCreateParams,
): {
  cluster?: string;
  cronExpression: string;
  draftDataSource: V1beta1DataSource;
  password?: string;
  registryURL: string;
  retainRevisions?: number;
  size: string;
  storageClassName?: string;
  username?: string;
} => {
  const { diskSize, registry: registryConfig, storageClassName } = values.imageSource;
  return {
    cluster: common.cluster,
    cronExpression: registryConfig.cronExpression,
    draftDataSource: common.draftDataSource,
    password: registryConfig.password,
    registryURL: registryConfig.image,
    retainRevisions: registryConfig.retainRevisions,
    size: diskSize,
    storageClassName,
    username: registryConfig.username,
  };
};

export const createSnapshotParams = (
  values: BootableVolumeWizardFormValues,
  common: CommonCreateParams,
): {
  cluster?: string;
  draftDataSource: V1beta1DataSource;
  snapshotName: string;
  snapshotNamespace: string;
} => ({
  cluster: common.cluster,
  draftDataSource: common.draftDataSource,
  snapshotName: values.imageSource.existingSnapshot.name,
  snapshotNamespace: values.imageSource.existingSnapshot.project,
});
