import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import ApplyStorageProfileSettingsCheckbox from '@kubevirt-utils/components/ApplyStorageProfileSettingsCheckbox/ApplyStorageProfileSettingsCheckbox';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Flex, FlexItem } from '@patternfly/react-core';

import { DiskFormState } from '../../utils/types';
import {
  accessModeField,
  storageProfileSettingsAppliedField,
  volumeModeField,
} from '../utils/constants';

import AccessMode from './AccessMode';
import VolumeMode from './VolumeMode';

import './ApplyStorageProfileSettings.scss';

const ApplyStorageProfileSettings: FC = () => {
  const { setValue, watch } = useFormContext<DiskFormState>();

  const { accessMode, storageClass, storageProfileSettingsApplied, volumeMode } = watch();
  const { claimPropertySets, loaded: storageProfileLoaded } =
    useStorageProfileClaimPropertySets(storageClass);

  const handleApplyOptimizedSettingsChange = (checked: boolean) => {
    setValue(storageProfileSettingsAppliedField, checked);
    if (!checked) {
      if (isEmpty(accessMode) && !isEmpty(claimPropertySets?.[0]?.accessModes[0])) {
        setValue(accessModeField, claimPropertySets?.[0]?.accessModes[0]);
      }
      if (isEmpty(volumeMode) && !isEmpty(claimPropertySets?.[0]?.volumeMode)) {
        setValue(volumeModeField, claimPropertySets?.[0]?.volumeMode);
      }
      return;
    }
    setValue(accessModeField, null);
    setValue(volumeModeField, null);
  };

  return (
    <div>
      <ApplyStorageProfileSettingsCheckbox
        claimPropertySets={claimPropertySets}
        disabled={!storageProfileLoaded || !claimPropertySets || isEmpty(claimPropertySets)}
        handleChange={handleApplyOptimizedSettingsChange}
        isChecked={storageProfileSettingsApplied}
      />
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
    </div>
  );
};

export default ApplyStorageProfileSettings;
