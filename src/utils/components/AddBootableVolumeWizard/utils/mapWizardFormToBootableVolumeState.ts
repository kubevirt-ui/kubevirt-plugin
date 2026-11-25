import {
  type DROPDOWN_FORM_SELECTION,
  initialBootableVolumeState,
} from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import type { AddBootableVolumeState } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import type { TLSCertSourceType } from '@kubevirt-utils/components/TLSCertificateSection';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';

import type { BootableVolumeWizardFormValues } from '../form/types';

type MapWizardFormToBootableVolumeStateArgs = {
  cluster?: string;
  values: BootableVolumeWizardFormValues;
};

export const mapWizardFormToBootableVolumeState = ({
  cluster,
  values,
}: MapWizardFormToBootableVolumeStateArgs): {
  bootableVolume: AddBootableVolumeState;
  sourceType: DROPDOWN_FORM_SELECTION;
} => {
  const { imageSource, operatingSystem, projectAndVolume } = values;
  const description = projectAndVolume.description?.trim();

  const bootableVolume: AddBootableVolumeState = {
    ...initialBootableVolumeState,
    accessMode: imageSource.accessMode,
    annotations: description ? { [ANNOTATIONS.description]: description } : {},
    architectures: operatingSystem.architectures,
    bootableVolumeCluster: cluster,
    bootableVolumeName: projectAndVolume.volumeName,
    bootableVolumeNamespace: projectAndVolume.destinationProject,
    cronExpression: imageSource.registry.cronExpression,
    isIso: imageSource.isIso,
    labels: operatingSystem.labels,
    lockedPreference: operatingSystem.lockedPreference,
    pvcName: imageSource.existingVolume.name,
    pvcNamespace: imageSource.existingVolume.project,
    registryCredentials: {
      password: imageSource.registry.password,
      username: imageSource.registry.username,
    },
    registryURL: imageSource.registry.image,
    retainRevisions: imageSource.registry.retainRevisions,
    size: imageSource.diskSize,
    snapshotName: imageSource.existingSnapshot.name,
    snapshotNamespace: imageSource.existingSnapshot.project,
    storageClassName: imageSource.storageClassName,
    tlsCertConfigMapName: imageSource.url.configMapName,
    tlsCertificate: imageSource.url.certificate,
    tlsCertificateRequired: imageSource.url.tlsCertificateRequired,
    tlsCertProject: imageSource.url.project,
    tlsCertSource: imageSource.url.certificateSource as TLSCertSourceType | undefined,
    uploadFile: imageSource.upload.file,
    uploadFilename: imageSource.upload.filename,
    url: imageSource.url.imageUrl,
    volumeMode: imageSource.volumeMode,
  };

  return { bootableVolume, sourceType: imageSource.sourceType };
};
