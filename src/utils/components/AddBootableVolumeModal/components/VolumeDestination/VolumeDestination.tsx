import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import ApplyStorageProfileSettingsCheckbox from '@kubevirt-utils/components/ApplyStorageProfileSettingsCheckbox/ApplyStorageProfileSettingsCheckbox';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UseStorageProfileClaimPropertySetsValue } from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import { FormGroup, Grid, GridItem, TextInput } from '@patternfly/react-core';

import { AddBootableVolumeState, SetBootableVolumeFieldType } from '../../utils/constants';

import DefaultStorageClassAlert from './StorageClass/DefaultStorageClassAlert';
import StorageClassSelect from './StorageClass/StorageClassSelect';

type VolumeDestinationProps = {
  applyStorageProfileState: [boolean, Dispatch<SetStateAction<boolean>>];
  bootableVolume: AddBootableVolumeState;
  claimPropertySetsData: UseStorageProfileClaimPropertySetsValue;
  namespace: string;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const VolumeDestination: FC<VolumeDestinationProps> = ({
  applyStorageProfileState,
  bootableVolume,
  claimPropertySetsData,
  namespace,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const [showSCAlert, setShowSCAlert] = useState(false);

  const { bootableVolumeName, size, storageClassName } = bootableVolume || {};

  const [applyStorageProfile, setApplyStorageProfile] = applyStorageProfileState;

  const { claimPropertySets, loaded: storageProfileLoaded } = claimPropertySetsData;

  return (
    <>
      <Grid hasGutter span={12}>
        <GridItem>
          <StorageClassSelect
            setShowSCAlert={setShowSCAlert}
            setStorageClassName={setBootableVolumeField('storageClassName')}
            storageClass={storageClassName}
          />
        </GridItem>
        <GridItem>
          <ApplyStorageProfileSettingsCheckbox
            claimPropertySets={claimPropertySets}
            disabled={!storageProfileLoaded}
            handleChange={setApplyStorageProfile}
            isChecked={applyStorageProfile}
          />
        </GridItem>
        <GridItem span={6}>
          <CapacityInput
            label={t('Disk size')}
            onChange={setBootableVolumeField('size')}
            size={size}
          />
        </GridItem>
        {showSCAlert && (
          <GridItem span={12}>
            <DefaultStorageClassAlert />
          </GridItem>
        )}
      </Grid>

      <FormGroup isRequired label={t('Volume name')}>
        <TextInput
          id="name"
          onChange={(_, value: string) => setBootableVolumeField('bootableVolumeName')(value)}
          type="text"
          value={bootableVolumeName}
        />
      </FormGroup>
      <FormGroup label={t('Destination project')}>
        <TextInput id="destination-project" isDisabled type="text" value={namespace} />
      </FormGroup>
    </>
  );
};

export default VolumeDestination;
