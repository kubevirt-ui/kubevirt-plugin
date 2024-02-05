import React, { useCallback, useEffect, useState } from 'react';

import {
  ACCESS_MODE_RADIO_OPTIONS,
  getAccessModeForProvisioner,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/modesMapping';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

type UploadPVCFormAccessModeProps = {
  availableAccessModes?: string[];
  initialAccessMode?: string;
  loaded: boolean;
  onChange: (accessMode: string) => void;
  provisioner: string;
};
const UploadPVCFormAccessMode: React.FC<UploadPVCFormAccessModeProps> = ({
  availableAccessModes = [],
  initialAccessMode,
  loaded,
  onChange,
  provisioner,
}) => {
  const { t } = useKubevirtTranslation();

  const [allowedAccessModes, setAllowedAccessModes] = useState<string[]>(availableAccessModes);
  const [accessMode, setAccessMode] = useState<string>(initialAccessMode);

  const changeAccessMode = useCallback(
    (mode: string) => {
      setAccessMode(mode);
      onChange(mode);
    },
    [onChange],
  );

  useEffect(() => {
    if (loaded) {
      setAllowedAccessModes(getAccessModeForProvisioner(provisioner, null));
    }
  }, [loaded, provisioner]);

  useEffect(() => {
    // Make sure the default or already checked radio button value is from any one of allowed the access mode
    if (allowedAccessModes && !allowedAccessModes.includes(accessMode)) {
      // Old access mode will be disabled
      changeAccessMode(allowedAccessModes?.[0]);
    }
  }, [accessMode, allowedAccessModes, changeAccessMode]);

  return (
    <FormGroup fieldId="access-mode" isRequired label={t('Access mode')}>
      {loaded &&
        allowedAccessModes &&
        ACCESS_MODE_RADIO_OPTIONS.map(({ label, value }) => {
          const disabled = !allowedAccessModes.includes(value);
          const checked = value === accessMode;
          return (
            <Radio
              checked={checked}
              id={label}
              isDisabled={disabled}
              key={value}
              label={label}
              name="accessMode"
              onChange={(_, event) => changeAccessMode(event?.currentTarget?.value)}
              value={value}
            />
          );
        })}
      {(!loaded || !allowedAccessModes) && <div className="skeleton-text" />}
    </FormGroup>
  );
};

export default UploadPVCFormAccessMode;
