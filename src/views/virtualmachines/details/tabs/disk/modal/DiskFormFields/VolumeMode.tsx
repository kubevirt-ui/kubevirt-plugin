import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import { diskReducerActions } from '../state/actions';
import { DiskFormState } from '../state/initialState';

import {
  AccessMode,
  getVolumeModeForProvisioner,
  getVolumeModeRadioOptions,
} from './utils/modesMapping';

type VolumeModeProps = {
  diskState: DiskFormState;
  dispatchDiskState: React.Dispatch<any>;
};

const VolumeMode: React.FC<VolumeModeProps> = ({ diskState, dispatchDiskState }) => {
  const { t } = useKubevirtTranslation();

  const {
    volumeMode,
    accessMode,
    storageProfileSettingsCheckboxDisabled,
    applyStorageProfileSettings,
    storageClassProvisioner,
  } = diskState || {};

  const allowedVolumeModes = getVolumeModeForProvisioner(
    storageClassProvisioner,
    accessMode as AccessMode,
  );
  const radios = getVolumeModeRadioOptions(t)?.map(({ value, label }) => (
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
  ));
  return (
    <FormGroup fieldId="volume-mode" label={t('Volume Mode')}>
      {!storageProfileSettingsCheckboxDisabled && applyStorageProfileSettings ? volumeMode : radios}
    </FormGroup>
  );
};

export default VolumeMode;
