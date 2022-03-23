import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import { diskReducerActions } from '../state/actions';
import { DiskFormState } from '../state/initialState';

import {
  getAccessModeForProvisioner,
  getAccessModeRadioOptions,
  VolumeMode,
} from './utils/modesMapping';

type AccessModeProps = {
  diskState: DiskFormState;
  dispatchDiskState: React.Dispatch<any>;
};

const AccessMode: React.FC<AccessModeProps> = ({ diskState, dispatchDiskState }) => {
  const { t } = useKubevirtTranslation();

  const {
    accessMode,
    volumeMode,
    storageProfileSettingsCheckboxDisabled,
    applyStorageProfileSettings,
    storageClassProvisioner,
  } = diskState || {};
  const allowedAccessModes = React.useMemo(() => {
    return getAccessModeForProvisioner(storageClassProvisioner, volumeMode as VolumeMode);
  }, [storageClassProvisioner, volumeMode]);
  const radios = getAccessModeRadioOptions(t)?.map(({ value, label }) => (
    <Radio
      name="accessMode"
      id={value}
      isChecked={value === accessMode}
      key={value}
      label={label}
      onChange={() =>
        dispatchDiskState({ type: diskReducerActions.SET_ACCESS_MODE, payload: value })
      }
      isDisabled={!allowedAccessModes?.includes(value)}
    />
  ));

  React.useEffect(() => {
    if (storageProfileSettingsCheckboxDisabled && !allowedAccessModes?.includes(accessMode)) {
      dispatchDiskState({
        type: diskReducerActions.SET_ACCESS_MODE,
        payload: allowedAccessModes[0],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessMode, allowedAccessModes, storageProfileSettingsCheckboxDisabled]);
  return (
    <FormGroup fieldId="access-mode" label={t('Access Mode')}>
      {!storageProfileSettingsCheckboxDisabled && applyStorageProfileSettings ? accessMode : radios}
    </FormGroup>
  );
};

export default AccessMode;
