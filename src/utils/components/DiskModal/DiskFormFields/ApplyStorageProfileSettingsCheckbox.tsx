import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';
import { DiskFormState } from '../state/initialState';

type ApplyStorageProfileSettingsCheckboxProps = {
  diskState: DiskFormState;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  claimPropertySets: {
    accessModes: string[];
    volumeMode?: string;
  }[];
  loaded: boolean;
};

const ApplyStorageProfileSettingsCheckbox: React.FC<ApplyStorageProfileSettingsCheckboxProps> = ({
  diskState,
  dispatchDiskState,
  claimPropertySets,
  loaded,
}) => {
  const { t } = useKubevirtTranslation();
  const { applyStorageProfileSettings } = diskState || {};

  React.useEffect(() => {
    dispatchDiskState({
      type: diskReducerActions.SET_STORAGE_PROFILE_SETTINGS_CHECKBOX_DISABLED,
      payload: !loaded || !claimPropertySets || isEmpty(claimPropertySets),
    });
  }, [claimPropertySets, dispatchDiskState, loaded]);

  return (
    <FormGroup
      fieldId="apply-storage-profile-settings"
      helperText={
        isEmpty(claimPropertySets)
          ? t('No optimized StorageProfile settings for this StorageClass.')
          : t('Optimized values Access mode: {{accessMode}}, Volume mode: {{volumeMode}}.', {
              accessMode: claimPropertySets?.[0]?.accessModes[0],
              volumeMode: claimPropertySets?.[0]?.volumeMode,
            })
      }
      isInline
    >
      <Checkbox
        id="apply-storage-profile-settings"
        isDisabled={!loaded || !claimPropertySets}
        label={t('Apply optimized StorageProfile settings')}
        isChecked={applyStorageProfileSettings}
        onChange={(checked) =>
          dispatchDiskState({
            type: diskReducerActions.SET_APPLY_STORAGE_PROFILE_SETTINGS,
            payload: checked,
          })
        }
      />
    </FormGroup>
  );
};

export default ApplyStorageProfileSettingsCheckbox;
