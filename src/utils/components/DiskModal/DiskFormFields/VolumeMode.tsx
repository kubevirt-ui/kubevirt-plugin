import * as React from 'react';

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
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  spVolumeMode?: string;
};

const VolumeMode: React.FC<VolumeModeProps> = ({ diskState, dispatchDiskState, spVolumeMode }) => {
  const { t } = useKubevirtTranslation();

  const {
    volumeMode,
    accessMode,
    storageProfileSettingsCheckboxDisabled,
    applyStorageProfileSettings,
    storageClassProvisioner,
  } = diskState || {};

  const allowedVolumeModes = React.useMemo(
    () => getVolumeModeForProvisioner(storageClassProvisioner, accessMode as AccessMode),
    [accessMode, storageClassProvisioner],
  );

  React.useEffect(() => {
    if (!storageProfileSettingsCheckboxDisabled) {
      if (applyStorageProfileSettings) {
        dispatchDiskState({
          type: diskReducerActions.SET_VOLUME_MODE,
          payload: null,
        });
      } else if (spVolumeMode && !volumeMode) {
        dispatchDiskState({
          type: diskReducerActions.SET_VOLUME_MODE,
          payload: spVolumeMode,
        });
      }
    } else if (!allowedVolumeModes?.includes(volumeMode as VolumeMode)) {
      dispatchDiskState({
        type: diskReducerActions.SET_VOLUME_MODE,
        payload: allowedVolumeModes[0],
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
      {getVolumeModeRadioOptions(t)?.map(({ value, label }) => (
        <Radio
          name="volumeMode"
          id={value}
          isChecked={value === volumeMode}
          key={value}
          label={label}
          onChange={() =>
            dispatchDiskState({ type: diskReducerActions.SET_VOLUME_MODE, payload: value })
          }
          isDisabled={!allowedVolumeModes?.includes(value)}
        />
      ))}
    </FormGroup>
  );
};

export default VolumeMode;
