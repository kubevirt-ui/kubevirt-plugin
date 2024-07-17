import React, { FC, useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { V1beta1StorageSpecVolumeModeEnum } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import {
  ACCESS_MODE_FIELD,
  STORAGE_CLASS_PROVIDER_FIELD,
  VOLUME_MODE_FIELD,
  VOLUMEMODE_FIELDID,
} from '../utils/constants';
import {
  ACCESS_MODES,
  getVolumeModeForProvisioner,
  VOLUME_MODE_RADIO_OPTIONS,
} from '../utils/modesMapping';

const VolumeMode: FC = () => {
  const { t } = useKubevirtTranslation();

  const { control, setValue, watch } = useFormContext<V1DiskFormState>();

  const volumeMode = watch(VOLUME_MODE_FIELD);
  const accessModes = watch(ACCESS_MODE_FIELD) as ACCESS_MODES[];
  const storageClassProvisioner = watch(STORAGE_CLASS_PROVIDER_FIELD);

  const allowedVolumeModes = useMemo(
    () => getVolumeModeForProvisioner(storageClassProvisioner, accessModes?.[0]),
    [accessModes, storageClassProvisioner],
  );

  useEffect(() => {
    if (!allowedVolumeModes?.includes(volumeMode as V1beta1StorageSpecVolumeModeEnum)) {
      setValue(VOLUME_MODE_FIELD, allowedVolumeModes[0]);
    }
  }, [allowedVolumeModes, volumeMode, setValue]);

  return (
    <FormGroup fieldId={VOLUMEMODE_FIELDID} label={t('Volume Mode')}>
      {VOLUME_MODE_RADIO_OPTIONS.map(({ label, value }) => (
        <Controller
          render={({ field: { onChange } }) => (
            <Radio
              id={value}
              isChecked={value === volumeMode}
              isDisabled={!allowedVolumeModes?.includes(value)}
              key={value}
              label={label}
              name={VOLUME_MODE_FIELD}
              onChange={() => onChange(value)}
            />
          )}
          control={control}
          key={value}
          name={VOLUME_MODE_FIELD}
        />
      ))}
    </FormGroup>
  );
};

export default VolumeMode;
