import { FieldError, FieldErrorsImpl } from 'react-hook-form';

import { V1beta1DataVolumeSourceRef, V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { V1DiskFormState } from '../../utils/types';

export const getSourceRef = (diskState: V1DiskFormState): V1beta1DataVolumeSourceRef =>
  diskState.dataVolumeTemplate?.spec?.sourceRef;

export const getPVCClaimName = (diskState: V1DiskFormState): string =>
  diskState.volume?.persistentVolumeClaim?.claimName;

export const getLunReservation = (disk: V1Disk): boolean => disk?.lun?.reservation;
export const getDiskSharable = (disk: V1Disk): boolean => disk?.shareable;

export const getErrorPVCName = (errors: FieldErrorsImpl<V1DiskFormState>): FieldError =>
  errors?.dataVolumeTemplate?.spec?.source?.pvc?.name;

export const getDataVolumeTemplateSize = (diskState: V1DiskFormState): string =>
  diskState.dataVolumeTemplate?.spec?.storage?.resources?.requests?.storage;
