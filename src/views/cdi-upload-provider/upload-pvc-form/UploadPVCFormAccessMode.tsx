import React, { useCallback, useEffect, useState } from 'react';

import {
  getAccessModeForProvisioner,
  getAccessModeRadioOptions,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/modesMapping';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

type UploadPVCFormAccessModeProps = {
  onChange: (accessMode: string) => void;
  availableAccessModes?: string[];
  loaded: boolean;
  provisioner: string;
  initialAccessMode?: string;
};
const UploadPVCFormAccessMode: React.FC<UploadPVCFormAccessModeProps> = ({
  onChange,
  loaded,
  provisioner,
  availableAccessModes = [],
  initialAccessMode,
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
    <FormGroup label={t('Access mode')} isRequired fieldId="access-mode">
      {loaded &&
        allowedAccessModes &&
        getAccessModeRadioOptions(t).map(({ value, label }) => {
          const disabled = !allowedAccessModes.includes(value);
          const checked = value === accessMode;
          return (
            <Radio
              value={value}
              label={label}
              id={label}
              key={value}
              onChange={(_, event) => changeAccessMode(event?.currentTarget?.value)}
              isDisabled={disabled}
              checked={checked}
              name="accessMode"
            />
          );
        })}
      {(!loaded || !allowedAccessModes) && <div className="skeleton-text" />}
    </FormGroup>
  );
};

export default UploadPVCFormAccessMode;
