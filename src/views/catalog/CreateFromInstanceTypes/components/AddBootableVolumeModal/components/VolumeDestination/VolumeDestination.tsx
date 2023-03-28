import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import DefaultStorageClassAlert from '@kubevirt-utils/components/DiskModal/DiskFormFields/StorageClass/DefaultStorageClassAlert';
import StorageClassSelect from '@kubevirt-utils/components/DiskModal/DiskFormFields/StorageClass/StorageClassSelect';
import { KUBEVIRT_OS_IMAGES_NS, OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isUpstream } from '@kubevirt-utils/utils/utils';
import { FormGroup, Grid, GridItem, TextInput } from '@patternfly/react-core';

import { AddBootableVolumeState } from '../../utils/constants';

type VolumeDestinationProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: (key: string, fieldKey?: string) => (value: string) => void;
  setBootableVolumeName: Dispatch<SetStateAction<string>>;
};

const VolumeDestination: FC<VolumeDestinationProps> = ({
  bootableVolume,
  setBootableVolumeField,
  setBootableVolumeName,
}) => {
  const { t } = useKubevirtTranslation();
  const [showSCAlert, setShowSCAlert] = useState(false);

  const { bootableVolumeName, size, storageClassName } = bootableVolume || {};

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
          onChange={setBootableVolumeName}
        />
      </FormGroup>
      <FormGroup label={t('Destination project')}>
        <TextInput
          id="destination-project"
          type="text"
          isDisabled
          value={isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS}
        />
      </FormGroup>
    </>
  );
};

export default VolumeDestination;
