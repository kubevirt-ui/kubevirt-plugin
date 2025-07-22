import React, { ChangeEvent, FC } from 'react';

import ContainerSource from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/StorageSection/CustomizeSource/Sources/ContainerSource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { AddBootableVolumeState, SetBootableVolumeFieldType } from '../../../utils/constants';

type RegistrySourceProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const RegistrySource: FC<RegistrySourceProps> = ({ bootableVolume, setBootableVolumeField }) => {
  const { t } = useKubevirtTranslation();
  const { registryCredentials = { password: '', username: '' }, registryURL = '' } = bootableVolume;

  const handleInputValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBootableVolumeField('registryURL')(e.target.value);
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
