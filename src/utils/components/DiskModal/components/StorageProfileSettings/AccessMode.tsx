import React, { FC, useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import { DiskFormState } from '../../utils/types';
import { accessModeField, accessModeFieldID } from '../utils/constants';
import {
  ACCESS_MODE_RADIO_OPTIONS,
  getAccessModeForProvisioner,
  VOLUME_MODES,
} from '../utils/modesMapping';

const AccessMode: FC = () => {
  const { t } = useKubevirtTranslation();

  const { control, setValue, watch } = useFormContext<DiskFormState>();

  const { accessMode, storageClassProvisioner, storageProfileSettingsApplied, volumeMode } =
    watch();

  const allowedAccessModes = useMemo(() => {
    return getAccessModeForProvisioner(storageClassProvisioner, volumeMode as VOLUME_MODES);
  }, [storageClassProvisioner, volumeMode]);

  useEffect(() => {
    if (!allowedAccessModes?.includes(accessMode)) {
      setValue(accessModeField, allowedAccessModes?.[0]);
    }
  }, [accessMode, allowedAccessModes, setValue]);

  if (storageProfileSettingsApplied) {
    return null;
  }

  return (
    <FormGroup fieldId={accessModeFieldID} label={t('Access Mode')}>
      {ACCESS_MODE_RADIO_OPTIONS.map(({ label, value }) => (
        <Controller
          render={({ field: { onChange } }) => (
            <Radio
              id={value}
              isChecked={value === accessMode}
              isDisabled={!allowedAccessModes?.includes(value)}
              key={value}
              label={label}
              name={accessModeField}
              onChange={() => onChange(value)}
            />
          )}
          control={control}
          key={value}
          name={accessModeField}
        />
      ))}
    </FormGroup>
  );
};

export default AccessMode;
