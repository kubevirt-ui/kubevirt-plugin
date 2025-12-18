import React, { FC, useState } from 'react';

import ApplyStorageProfileSettings from '@kubevirt-utils/components/ApplyStorageProfileSettings/ApplyStorageProfileSettings';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import ProjectDropdown from '@kubevirt-utils/components/ProjectDropdown/ProjectDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection, FormGroup, Grid, GridItem, TextInput } from '@patternfly/react-core';

import { AddBootableVolumeState, SetBootableVolumeFieldType } from '../../utils/constants';

import DefaultStorageClassAlert from './StorageClass/DefaultStorageClassAlert';
import StorageClassSelect from './StorageClass/StorageClassSelect';

type VolumeDestinationProps = {
  bootableVolume: AddBootableVolumeState;
  isSnapshotSourceType?: boolean;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const VolumeDestination: FC<VolumeDestinationProps> = ({
  bootableVolume,
  isSnapshotSourceType,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const [showSCAlert, setShowSCAlert] = useState(false);

  const {
    accessMode,
    bootableVolumeCluster,
    bootableVolumeName,
    bootableVolumeNamespace,
    size,
    storageClassName,
    volumeMode,
  } = bootableVolume || {};

  return (
    <>
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
          cluster={bootableVolumeCluster}
          includeAllProjects={false}
          onChange={setBootableVolumeField('bootableVolumeNamespace')}
          selectedProject={bootableVolumeNamespace}
        />
      </FormGroup>

      <Grid hasGutter span={12}>
        <GridItem>
          <CapacityInput
            helperText={
              isSnapshotSourceType && t('Disk size will be determined by the volume snapshot size')
            }
            isDisabled={isSnapshotSourceType}
            label={t('Disk size')}
            onChange={setBootableVolumeField('size')}
            size={size}
          />
        </GridItem>
        <GridItem>
          <StorageClassSelect
            cluster={bootableVolumeCluster}
            setShowSCAlert={setShowSCAlert}
            setStorageClassName={setBootableVolumeField('storageClassName')}
            storageClass={storageClassName}
          />
        </GridItem>
        <GridItem>
          <ExpandableSection isIndented toggleText={t('Advanced settings')}>
            <ApplyStorageProfileSettings
              {...{ accessMode, storageClassName, volumeMode }}
              setAccessMode={setBootableVolumeField('accessMode')}
              setVolumeMode={setBootableVolumeField('volumeMode')}
            />
          </ExpandableSection>
        </GridItem>
        {showSCAlert && (
          <GridItem span={12}>
            <DefaultStorageClassAlert />
          </GridItem>
        )}
      </Grid>
    </>
  );
};

export default VolumeDestination;
