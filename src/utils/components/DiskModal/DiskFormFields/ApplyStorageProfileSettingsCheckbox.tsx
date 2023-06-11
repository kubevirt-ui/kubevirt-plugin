import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';
import { DiskFormState } from '../state/initialState';

type ApplyStorageProfileSettingsCheckboxProps = {
  claimPropertySets: {
    accessModes: string[];
    volumeMode?: string;
  }[];
  diskState: DiskFormState;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  loaded: boolean;
};

const ApplyStorageProfileSettingsCheckbox: React.FC<ApplyStorageProfileSettingsCheckboxProps> = ({
  claimPropertySets,
  diskState,
  dispatchDiskState,
  loaded,
}) => {
  const { t } = useKubevirtTranslation();
  const { applyStorageProfileSettings } = diskState || {};

  React.useEffect(() => {
    dispatchDiskState({
      payload: !loaded || !claimPropertySets || isEmpty(claimPropertySets),
      type: diskReducerActions.SET_STORAGE_PROFILE_SETTINGS_CHECKBOX_DISABLED,
    });
  }, [claimPropertySets, dispatchDiskState, loaded]);

  return (
    <FormGroup
      helperText={
        isEmpty(claimPropertySets)
          ? t('No optimized StorageProfile settings for this StorageClass.')
          : t('Optimized values Access mode: {{accessMode}}, Volume mode: {{volumeMode}}.', {
              accessMode: claimPropertySets?.[0]?.accessModes[0],
              volumeMode: claimPropertySets?.[0]?.volumeMode,
            })
      }
      fieldId="apply-storage-profile-settings"
      isInline
    >
      <Checkbox
        onChange={(checked) =>
          dispatchDiskState({
            payload: checked,
            type: diskReducerActions.SET_APPLY_STORAGE_PROFILE_SETTINGS,
          })
        }
        id="apply-storage-profile-settings"
        isChecked={applyStorageProfileSettings}
        isDisabled={!loaded || !claimPropertySets}
        label={t('Apply optimized StorageProfile settings')}
      />
    </FormGroup>
  );
};

export default ApplyStorageProfileSettingsCheckbox;
