import React, { FC, useState } from 'react';

import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import DefaultStorageClassAlert from '@kubevirt-utils/components/DiskModal/DiskFormFields/StorageClass/DefaultStorageClassAlert';
import StorageClassSelect from '@kubevirt-utils/components/DiskModal/DiskFormFields/StorageClass/StorageClassSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Grid, GridItem, TextInput } from '@patternfly/react-core';

import { AddBootableVolumeState } from '../../utils/constants';
import FilterSelect from '../FilterSelect/FilterSelect';

type VolumeDestinationProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: (key: string, fieldKey?: string) => (value: string) => void;
};

const VolumeDestination: FC<VolumeDestinationProps> = ({
  bootableVolume,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const [showSCAlert, setShowSCAlert] = useState(false);
  const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    namespaced: false,
    isList: true,
  });

  const { bootableVolumeName, size, storageClassName, bootableVolumeNamespace } =
    bootableVolume || {};

  return (
    <>
      <Grid hasGutter span={12}>
        <GridItem span={6}>
          <StorageClassSelect
            storageClass={storageClassName}
            setStorageClassName={setBootableVolumeField('storageClassName')}
            setShowSCAlert={setShowSCAlert}
          />
        </GridItem>
        <GridItem span={6}>
          <CapacityInput
            size={size}
            onChange={setBootableVolumeField('size')}
            label={t('Disk size')}
          />
        </GridItem>
        {showSCAlert && (
          <GridItem span={12}>
            <DefaultStorageClassAlert />
          </GridItem>
        )}
      </Grid>

      <FormGroup label={t('Volume name')} isRequired>
        <TextInput
          id="name"
          type="text"
          value={bootableVolumeName}
          onChange={setBootableVolumeField('bootableVolumeName')}
        />
      </FormGroup>

      <FormGroup label={t('Destination project')}>
        <FilterSelect
          selected={bootableVolumeNamespace}
          setSelected={setBootableVolumeField('bootableVolumeNamespace')}
          groupVersionKind={modelToGroupVersionKind(ProjectModel)}
          options={projects?.map(getName)}
          optionLabelText={t('Project')}
        />
      </FormGroup>
    </>
  );
};

export default VolumeDestination;
