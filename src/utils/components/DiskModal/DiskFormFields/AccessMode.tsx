import React, { Dispatch, FC, useEffect, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';
import { DiskFormState } from '../state/initialState';

import {
  ACCESS_MODE_RADIO_OPTIONS,
  getAccessModeForProvisioner,
  VolumeMode,
} from './utils/modesMapping';

type AccessModeProps = {
  diskState: DiskFormState;
  dispatchDiskState: Dispatch<DiskReducerActionType>;
  spAccessMode?: string;
};

const AccessMode: FC<AccessModeProps> = ({ diskState, dispatchDiskState, spAccessMode }) => {
  const { t } = useKubevirtTranslation();

  const {
    accessMode,
    applyStorageProfileSettings,
    storageClassProvisioner,
    storageProfileSettingsCheckboxDisabled,
    volumeMode,
  } = diskState || {};

  const allowedAccessModes = useMemo(() => {
    return getAccessModeForProvisioner(storageClassProvisioner, volumeMode as VolumeMode);
  }, [storageClassProvisioner, volumeMode]);

  useEffect(() => {
    if (!storageProfileSettingsCheckboxDisabled) {
      if (applyStorageProfileSettings) {
        dispatchDiskState({
          payload: null,
          type: diskReducerActions.SET_ACCESS_MODE,
        });
      } else if (spAccessMode && !accessMode) {
        dispatchDiskState({
          payload: spAccessMode,
          type: diskReducerActions.SET_ACCESS_MODE,
        });
      }
    } else if (!allowedAccessModes?.includes(accessMode)) {
      dispatchDiskState({
        payload: allowedAccessModes?.[0],
        type: diskReducerActions.SET_ACCESS_MODE,
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
      {ACCESS_MODE_RADIO_OPTIONS.map(({ label, value }) => (
        <Radio
          onChange={() =>
            dispatchDiskState({ payload: value, type: diskReducerActions.SET_ACCESS_MODE })
          }
          id={value}
          isChecked={value === accessMode}
          isDisabled={!allowedAccessModes?.includes(value) || applyStorageProfileSettings}
          key={value}
          label={label}
          name="accessMode"
        />
      ))}
    </FormGroup>
  );
};

export default AccessMode;
