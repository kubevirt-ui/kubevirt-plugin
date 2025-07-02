import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import ApplyStorageProfileSettings from '@kubevirt-utils/components/ApplyStorageProfileSettings/ApplyStorageProfileSettings';

import { V1DiskFormState } from '../../utils/types';
import {
  ACCESS_MODE_FIELD,
  DATAVOLUME_TEMPLATE_STORAGE,
  VOLUME_MODE_FIELD,
} from '../utils/constants';

const ApplyStorageProfileSettingsToDisk: FC = () => {
  const { setValue, watch } = useFormContext<V1DiskFormState>();

  const [storage, accessModes, volumeMode] = watch([
    DATAVOLUME_TEMPLATE_STORAGE,
    ACCESS_MODE_FIELD,
    VOLUME_MODE_FIELD,
  ]);
  const { storageClassName = '' } = storage ?? {};

  const accessMode = accessModes?.[0];

  return (
    <ApplyStorageProfileSettings
      {...{ accessMode, storageClassName, volumeMode }}
      setAccessMode={(value) => setValue(ACCESS_MODE_FIELD, value ? [value] : undefined)}
      setVolumeMode={(value) => setValue(VOLUME_MODE_FIELD, value)}
    />
  );
};

export default ApplyStorageProfileSettingsToDisk;
