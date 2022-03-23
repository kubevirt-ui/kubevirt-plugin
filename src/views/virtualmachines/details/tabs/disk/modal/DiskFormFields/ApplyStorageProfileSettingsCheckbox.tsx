import * as React from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import StorageProfileModel from '@kubevirt-ui/kubevirt-api/console/models/StorageProfileModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';
import { DiskFormState } from '../state/initialState';

import { StorageProfile } from './utils/constants';

type ApplyStorageProfileSettingsCheckboxProps = {
  diskState: DiskFormState;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
};

const ApplyStorageProfileSettingsCheckbox: React.FC<ApplyStorageProfileSettingsCheckboxProps> = ({
  diskState,
  dispatchDiskState,
}) => {
  const { t } = useKubevirtTranslation();
  const { storageClass, applyStorageProfileSettings } = diskState || {};

  const watchStorageProfileResource = React.useMemo(() => {
    return {
      groupVersionKind: modelToGroupVersionKind(StorageProfileModel),
      isList: false,
      name: storageClass,
    };
  }, [storageClass]);

  const [storageProfile, loaded] = useK8sWatchResource<StorageProfile>(watchStorageProfileResource);

  const { claimPropertySets } = storageProfile?.status || {};

  React.useEffect(() => {
    dispatchDiskState({
      type: diskReducerActions.SET_STORAGE_PROFILE_SETTINGS_CHECKBOX_DISABLED,
      payload: !loaded || !claimPropertySets,
    });
    if (!loaded) {
      return;
    }

    if (applyStorageProfileSettings && claimPropertySets?.length > 0) {
      const firstCliamPropertySet = claimPropertySets?.[0];
      dispatchDiskState({
        type: diskReducerActions.SET_ACCESS_MODE,
        payload: firstCliamPropertySet?.accessModes?.[0],
      });
      dispatchDiskState({
        type: diskReducerActions.SET_VOLUME_MODE,
        payload: firstCliamPropertySet?.volumeMode,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyStorageProfileSettings, claimPropertySets, loaded]);

  return (
    <FormGroup
      fieldId="apply-storage-profile-settings"
      helperText={t(
        'Use optimized access mode & volume mode settings from StorageProfile resource.',
      )}
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
