import React, { ChangeEvent, FC } from 'react';

import ContainerSource from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/StorageSection/CustomizeSource/Sources/ContainerSource';
import { formatRegistryURL } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { removeAllWhitespace } from '@kubevirt-utils/utils/utils';

import { AddBootableVolumeState, SetBootableVolumeFieldType } from '../../../utils/constants';

type RegistrySourceProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const RegistrySource: FC<RegistrySourceProps> = ({ bootableVolume, setBootableVolumeField }) => {
  const { t } = useKubevirtTranslation();
  const { registryCredentials = { password: '', username: '' }, registryURL = '' } = bootableVolume;

  const handleInputValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const trimmedValue = removeAllWhitespace(e.target.value);
    setBootableVolumeField('registryURL')(formatRegistryURL(trimmedValue));
  };

  const handleCredentialsChange = (updatedCreds: { password: string; username: string }) => {
    setBootableVolumeField('registryCredentials')(updatedCreds);
  };

  return (
    <ContainerSource
      containerImage={registryURL}
      onInputValueChange={handleInputValueChange}
      registryCredentials={registryCredentials}
      registrySourceHelperText={t('Example: quay.io/containerdisks/centos:7-2009')}
      selectedSourceType="registry"
      setRegistryCredentials={handleCredentialsChange}
      testId="volume-registry"
    />
  );
};

export default RegistrySource;
