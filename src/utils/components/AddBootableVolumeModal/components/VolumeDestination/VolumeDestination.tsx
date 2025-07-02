import React, { FC, useState } from 'react';

import ApplyStorageProfileSettings from '@kubevirt-utils/components/ApplyStorageProfileSettings/ApplyStorageProfileSettings';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import ProjectDropdown from '@kubevirt-utils/components/ProjectDropdown/ProjectDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Grid, GridItem, TextInput } from '@patternfly/react-core';

import { AddBootableVolumeState, SetBootableVolumeFieldType } from '../../utils/constants';

import DefaultStorageClassAlert from './StorageClass/DefaultStorageClassAlert';
import StorageClassSelect from './StorageClass/StorageClassSelect';

type VolumeDestinationProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const VolumeDestination: FC<VolumeDestinationProps> = ({
  bootableVolume,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const [showSCAlert, setShowSCAlert] = useState(false);

  const {
    accessMode,
    bootableVolumeName,
    bootableVolumeNamespace,
    size,
    storageClassName,
    volumeMode,
  } = bootableVolume || {};

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
          <ApplyStorageProfileSettings
            {...{ accessMode, storageClassName, volumeMode }}
            setAccessMode={setBootableVolumeField('accessMode')}
            setVolumeMode={setBootableVolumeField('volumeMode')}
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
        <ProjectDropdown
          includeAllProjects={false}
          onChange={setBootableVolumeField('bootableVolumeNamespace')}
          selectedProject={bootableVolumeNamespace}
        />
      </FormGroup>
    </>
  );
};

export default VolumeDestination;
