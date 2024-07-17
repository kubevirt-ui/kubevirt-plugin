import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { V1beta1StorageSpecVolumeModeEnum } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ApplyStorageProfileSettingsCheckbox from '@kubevirt-utils/components/ApplyStorageProfileSettingsCheckbox/ApplyStorageProfileSettingsCheckbox';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Flex, FlexItem } from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import {
  ACCESS_MODE_FIELD,
  DATAVOLUME_TEMPLATE_STORAGE,
  STORAGE_PROFILE_SETTINGS_APPLIED_FIELD,
  VOLUME_MODE_FIELD,
} from '../utils/constants';

import AccessMode from './AccessMode';
import VolumeMode from './VolumeMode';

import './ApplyStorageProfileSettings.scss';

const ApplyStorageProfileSettings: FC = () => {
  const { setValue, watch } = useFormContext<V1DiskFormState>();

  const [storageProfileSettingsApplied, storage] = watch([
    STORAGE_PROFILE_SETTINGS_APPLIED_FIELD,
    DATAVOLUME_TEMPLATE_STORAGE,
  ]);

  const { accessModes, storageClassName, volumeMode } = storage;

  const { claimPropertySets, loaded: storageProfileLoaded } =
    useStorageProfileClaimPropertySets(storageClassName);

  const handleApplyOptimizedSettingsChange = (checked: boolean) => {
    setValue(STORAGE_PROFILE_SETTINGS_APPLIED_FIELD, checked);

    if (checked) {
      setValue(ACCESS_MODE_FIELD, null);
      setValue(VOLUME_MODE_FIELD, null);
      return;
    }

    const propertySet = claimPropertySets?.[0];

    if (isEmpty(accessModes) && !isEmpty(propertySet?.accessModes[0])) {
      setValue(ACCESS_MODE_FIELD, [propertySet?.accessModes[0]]);
    }
    if (isEmpty(volumeMode) && !isEmpty(propertySet?.volumeMode)) {
      setValue(VOLUME_MODE_FIELD, propertySet?.volumeMode as V1beta1StorageSpecVolumeModeEnum);
    }
  };

  return (
    <div>
      <ApplyStorageProfileSettingsCheckbox
        claimPropertySets={claimPropertySets}
        disabled={!storageProfileLoaded || !claimPropertySets || isEmpty(claimPropertySets)}
        handleChange={handleApplyOptimizedSettingsChange}
        isChecked={storageProfileSettingsApplied}
      />
      {!storageProfileSettingsApplied && (
        <Flex
          className="ApplyStorageProfileSettings--volume-access-section"
          spaceItems={{ default: 'spaceItems3xl' }}
        >
          <FlexItem>
            <AccessMode />
          </FlexItem>
          <FlexItem>
            <VolumeMode />
          </FlexItem>
        </Flex>
      )}
    </div>
  );
};

export default ApplyStorageProfileSettings;
