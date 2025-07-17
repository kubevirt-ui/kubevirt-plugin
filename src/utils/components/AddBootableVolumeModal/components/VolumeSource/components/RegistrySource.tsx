import React, { FC, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import ContainerSource from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/StorageSection/CustomizeSource/Sources/ContainerSource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { AddBootableVolumeState, SetBootableVolumeFieldType } from '../../../utils/constants';

type RegistrySourceProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const RegistrySource: FC<RegistrySourceProps> = ({ bootableVolume, setBootableVolumeField }) => {
  const { t } = useKubevirtTranslation();
  const { registryCredentials, registryURL } = bootableVolume || {};

  const methods = useForm({
    defaultValues: {
      'volume-registry-containerImage': registryURL || '',
      'volume-registry-password': registryCredentials?.password || '',
      'volume-registry-username': registryCredentials?.username || '',
    },
    mode: 'all',
  });

  const { setValue, watch } = methods;

  const formValues = watch();

  useEffect(() => {
    if (formValues['volume-registry-containerImage'] !== registryURL) {
      setBootableVolumeField('registryURL')(formValues['volume-registry-containerImage'] || '');
    }

    const currentCredentials = registryCredentials || { password: '', username: '' };
    const newCredentials = {
      password: formValues['volume-registry-password'] || '',
      username: formValues['volume-registry-username'] || '',
    };

    if (
      currentCredentials.username !== newCredentials.username ||
      currentCredentials.password !== newCredentials.password
    ) {
      setBootableVolumeField('registryCredentials')(newCredentials);
    }
  }, [formValues, registryURL, registryCredentials, setBootableVolumeField]);

  useEffect(() => {
    setValue('volume-registry-containerImage', registryURL || '');
  }, [registryURL, setValue]);

  useEffect(() => {
    setValue('volume-registry-username', registryCredentials?.username || '');
    setValue('volume-registry-password', registryCredentials?.password || '');
  }, [registryCredentials, setValue]);

  const handleInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('volume-registry-containerImage', e.target.value);
  };

  const handleCredentialsChange = (credentials: { password: string; username: string }) => {
    setValue('volume-registry-username', credentials.username);
    setValue('volume-registry-password', credentials.password);
  };

  return (
    <FormProvider {...methods}>
      <ContainerSource
        onInputValueChange={handleInputValueChange}
        registryCredentials={registryCredentials || { password: '', username: '' }}
        registrySourceHelperText={t('Example: quay.io/containerdisks/centos:7-2009')}
        selectedSourceType="registry"
        setRegistryCredentials={handleCredentialsChange}
        testId="volume-registry"
      />
    </FormProvider>
  );
};

export default RegistrySource;
