import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';
import { DiskFormState } from '../state/initialState';

import {
  getAccessModeForProvisioner,
  getAccessModeRadioOptions,
  VolumeMode,
} from './utils/modesMapping';

type AccessModeProps = {
  diskState: DiskFormState;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  spAccessMode?: string;
};

const AccessMode: React.FC<AccessModeProps> = ({ diskState, dispatchDiskState, spAccessMode }) => {
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

  React.useEffect(() => {
    if (!storageProfileSettingsCheckboxDisabled) {
      if (applyStorageProfileSettings) {
        dispatchDiskState({
          type: diskReducerActions.SET_ACCESS_MODE,
          payload: null,
        });
      } else if (spAccessMode && !accessMode) {
        dispatchDiskState({
          type: diskReducerActions.SET_ACCESS_MODE,
          payload: spAccessMode,
        });
      }
    } else if (!allowedAccessModes?.includes(accessMode)) {
      dispatchDiskState({
        type: diskReducerActions.SET_ACCESS_MODE,
        payload: allowedAccessModes[0],
      });
    }
  }, [
    accessMode,
    allowedAccessModes,
    applyStorageProfileSettings,
    dispatchDiskState,
    spAccessMode,
    storageProfileSettingsCheckboxDisabled,
  ]);

  if (!storageProfileSettingsCheckboxDisabled && applyStorageProfileSettings) {
    return null;
  }

  return (
    <FormGroup fieldId="access-mode" label={t('Access Mode')}>
      {getAccessModeRadioOptions(t)?.map(({ value, label }) => (
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
      ))}
    </FormGroup>
  );
};

export default AccessMode;
