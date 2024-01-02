import React, { Dispatch, FC, useEffect, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';
import { DiskFormState } from '../state/initialState';

import {
  AccessMode,
  getVolumeModeForProvisioner,
  getVolumeModeRadioOptions,
  VolumeMode,
} from './utils/modesMapping';

type VolumeModeProps = {
  diskState: DiskFormState;
  dispatchDiskState: Dispatch<DiskReducerActionType>;
  spVolumeMode?: string;
};

const VolumeMode: FC<VolumeModeProps> = ({ diskState, dispatchDiskState, spVolumeMode }) => {
  const { t } = useKubevirtTranslation();

  const {
    accessMode,
    applyStorageProfileSettings,
    storageClassProvisioner,
    storageProfileSettingsCheckboxDisabled,
    volumeMode,
  } = diskState || {};

  const allowedVolumeModes = useMemo(
    () => getVolumeModeForProvisioner(storageClassProvisioner, accessMode as AccessMode),
    [accessMode, storageClassProvisioner],
  );

  useEffect(() => {
    if (!storageProfileSettingsCheckboxDisabled) {
      if (applyStorageProfileSettings) {
        dispatchDiskState({
          payload: null,
          type: diskReducerActions.SET_VOLUME_MODE,
        });
      } else if (spVolumeMode && !volumeMode) {
        dispatchDiskState({
          payload: spVolumeMode,
          type: diskReducerActions.SET_VOLUME_MODE,
        });
      }
    } else if (!allowedVolumeModes?.includes(volumeMode as VolumeMode)) {
      dispatchDiskState({
        payload: allowedVolumeModes[0],
        type: diskReducerActions.SET_VOLUME_MODE,
      });
    }
  }, [
    allowedVolumeModes,
    applyStorageProfileSettings,
    dispatchDiskState,
    spVolumeMode,
    storageProfileSettingsCheckboxDisabled,
    volumeMode,
  ]);

  if (!storageProfileSettingsCheckboxDisabled && applyStorageProfileSettings) {
    return null;
  }

  return (
    <FormGroup fieldId="volume-mode" label={t('Volume Mode')}>
      {getVolumeModeRadioOptions(t)?.map(({ label, value }) => (
        <Radio
          onChange={() =>
            dispatchDiskState({ payload: value, type: diskReducerActions.SET_VOLUME_MODE })
          }
          id={value}
          isChecked={value === volumeMode}
          isDisabled={!allowedVolumeModes?.includes(value) || applyStorageProfileSettings}
          key={value}
          label={label}
          name="volumeMode"
        />
      ))}
    </FormGroup>
  );
};

export default VolumeMode;
