import type { TFunction } from 'i18next';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import type { LabelProps } from '@patternfly/react-core';

export const getDataVolumePhase = (dataVolume: V1beta1DataVolume): string | undefined =>
  dataVolume?.status?.phase;

export const getDataVolumeProgress = (dataVolume: V1beta1DataVolume): string | undefined =>
  dataVolume?.status?.progress;

export const getDataVolumeClaimName = (dataVolume: V1beta1DataVolume): string | undefined =>
  dataVolume?.status?.claimName;

export const getDataVolumeCapacity = (dataVolume: V1beta1DataVolume): string | undefined =>
  dataVolume?.spec?.storage?.resources?.requests?.storage ??
  dataVolume?.spec?.pvc?.resources?.requests?.storage;

export const getDataVolumeStorageClass = (dataVolume: V1beta1DataVolume): string | undefined =>
  dataVolume?.spec?.storage?.storageClassName ?? dataVolume?.spec?.pvc?.storageClassName;

type StatusLabel = { color: LabelProps['color']; text: string };

export const getDataVolumePhaseLabel = (phase: string | undefined, t: TFunction): StatusLabel => {
  switch (phase) {
    case 'Succeeded':
      return { color: 'green', text: t('Succeeded') };
    case 'Failed':
      return { color: 'red', text: t('Failed') };
    case 'Unknown':
      return { color: 'grey', text: t('Unknown') };
    case 'ImportInProgress':
    case 'CloneInProgress':
    case 'SnapshotInProgress':
    case 'UploadReady':
    case 'PendingPopulation':
    case 'WaitForFirstConsumer':
      return { color: 'blue', text: phase };
    case 'PVCBound':
      return { color: 'cyan', text: phase };
    default:
      return { color: 'grey', text: phase || t('Unknown') };
  }
};
