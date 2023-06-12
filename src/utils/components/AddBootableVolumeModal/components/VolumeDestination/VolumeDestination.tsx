import React, { FC, useState } from 'react';

import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import DefaultStorageClassAlert from '@kubevirt-utils/components/DiskModal/DiskFormFields/StorageClass/DefaultStorageClassAlert';
import StorageClassSelect from '@kubevirt-utils/components/DiskModal/DiskFormFields/StorageClass/StorageClassSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Grid, GridItem, TextInput } from '@patternfly/react-core';

import { AddBootableVolumeState, SetBootableVolumeFieldType } from '../../utils/constants';

type VolumeDestinationProps = {
  bootableVolume: AddBootableVolumeState;
  namespace: string;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const VolumeDestination: FC<VolumeDestinationProps> = ({
  bootableVolume,
  namespace,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const [showSCAlert, setShowSCAlert] = useState(false);

  const { bootableVolumeName, size, storageClassName } = bootableVolume || {};

  return (
    <>
      <Grid hasGutter span={12}>
        <GridItem span={6}>
          <StorageClassSelect
            setShowSCAlert={setShowSCAlert}
            setStorageClassName={setBootableVolumeField('storageClassName')}
            storageClass={storageClassName}
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
          onChange={setBootableVolumeField('bootableVolumeName')}
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
