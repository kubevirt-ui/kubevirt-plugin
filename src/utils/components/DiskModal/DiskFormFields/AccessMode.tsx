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
    applyStorageProfileSettings,
    storageClassProvisioner,
    storageProfileSettingsCheckboxDisabled,
    volumeMode,
  } = diskState || {};

  const allowedAccessModes = React.useMemo(() => {
    return getAccessModeForProvisioner(storageClassProvisioner, volumeMode as VolumeMode);
  }, [storageClassProvisioner, volumeMode]);

  React.useEffect(() => {
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
        payload: allowedAccessModes[0],
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
      {getAccessModeRadioOptions(t)?.map(({ label, value }) => (
        <Radio
          onChange={() =>
            dispatchDiskState({ payload: value, type: diskReducerActions.SET_ACCESS_MODE })
          }
          id={value}
          isChecked={value === accessMode}
          isDisabled={!allowedAccessModes?.includes(value)}
          key={value}
          label={label}
          name="accessMode"
        />
      ))}
    </FormGroup>
  );
};

export default AccessMode;
