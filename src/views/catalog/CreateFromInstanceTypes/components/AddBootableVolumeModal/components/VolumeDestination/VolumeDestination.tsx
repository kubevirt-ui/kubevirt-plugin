import React, { Dispatch, FC, SetStateAction } from 'react';

import { KUBEVIRT_OS_IMAGES_NS, OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isUpstream } from '@kubevirt-utils/utils/utils';
import { FormGroup, TextInput } from '@patternfly/react-core';

type VolumeDestinationProps = {
  bootableVolumeName: string;
  setBootableVolumeName: Dispatch<SetStateAction<string>>;
};

const VolumeDestination: FC<VolumeDestinationProps> = ({
  bootableVolumeName,
  setBootableVolumeName,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
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
