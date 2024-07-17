import React, { FC, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { V1beta1StorageSpecVolumeModeEnum } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import {
  ACCESS_MODE_FIELD,
  ACCESS_MODE_FIELDID,
  STORAGE_CLASS_PROVIDER_FIELD,
  VOLUME_MODE_FIELD,
} from '../utils/constants';
import { ACCESS_MODE_RADIO_OPTIONS, getAccessModeForProvisioner } from '../utils/modesMapping';

const AccessMode: FC = () => {
  const { t } = useKubevirtTranslation();

  const { setValue, watch } = useFormContext<V1DiskFormState>();

  const [storageClassProvisioner, accessModes, volumeMode] = watch([
    STORAGE_CLASS_PROVIDER_FIELD,
    ACCESS_MODE_FIELD,
    VOLUME_MODE_FIELD,
  ]);

  const accessMode = accessModes?.[0];

  const allowedAccessModes = useMemo(() => {
    return getAccessModeForProvisioner(
      storageClassProvisioner,
      volumeMode as V1beta1StorageSpecVolumeModeEnum,
    );
  }, [storageClassProvisioner, volumeMode]);

  useEffect(() => {
    if (!allowedAccessModes?.includes(accessMode)) {
      setValue(ACCESS_MODE_FIELD, [allowedAccessModes?.[0]]);
    }
  }, [accessMode, allowedAccessModes, setValue]);

  return (
    <FormGroup fieldId={ACCESS_MODE_FIELDID} label={t('Access Mode')}>
      {ACCESS_MODE_RADIO_OPTIONS.map(({ label, value }) => (
        <Radio
          id={value}
          isChecked={value === accessMode}
          isDisabled={!allowedAccessModes?.includes(value)}
          key={value}
          label={label}
          name={ACCESS_MODE_FIELD}
          onChange={() => setValue(ACCESS_MODE_FIELD, [value])}
        />
      ))}
    </FormGroup>
  );
};

export default AccessMode;
