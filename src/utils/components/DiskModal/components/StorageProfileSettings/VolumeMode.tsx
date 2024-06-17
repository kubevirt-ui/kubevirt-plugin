import React, { FC, useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import { DiskFormState } from '../../utils/types';
import { volumeModeField, volumeModeFieldID } from '../utils/constants';
import {
  ACCESS_MODES,
  getVolumeModeForProvisioner,
  VOLUME_MODE_RADIO_OPTIONS,
  VOLUME_MODES,
} from '../utils/modesMapping';

const VolumeMode: FC = () => {
  const { t } = useKubevirtTranslation();

  const { control, setValue, watch } = useFormContext<DiskFormState>();

  const { accessMode, storageClassProvisioner, volumeMode } = watch();

  const allowedVolumeModes = useMemo(
    () => getVolumeModeForProvisioner(storageClassProvisioner, accessMode as ACCESS_MODES),
    [accessMode, storageClassProvisioner],
  );

  useEffect(() => {
    if (!allowedVolumeModes?.includes(volumeMode as VOLUME_MODES)) {
      setValue(volumeModeField, allowedVolumeModes[0]);
    }
  }, [allowedVolumeModes, volumeMode, setValue]);

  return (
    <FormGroup fieldId={volumeModeFieldID} label={t('Volume Mode')}>
      {VOLUME_MODE_RADIO_OPTIONS.map(({ label, value }) => (
        <Controller
          render={({ field: { onChange } }) => (
            <Radio
              id={value}
              isChecked={value === volumeMode}
              isDisabled={!allowedVolumeModes?.includes(value)}
              key={value}
              label={label}
              name={volumeModeField}
              onChange={() => onChange(value)}
            />
          )}
          control={control}
          key={value}
          name={volumeModeField}
        />
      ))}
    </FormGroup>
  );
};

export default VolumeMode;
