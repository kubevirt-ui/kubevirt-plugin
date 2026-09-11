import { type ChangeEvent, type FC, type ReactElement } from 'react';

import ContainerSource from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeSource/components/ContainerSource';
import { formatRegistryURL } from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { removeAllWhitespace } from '@kubevirt-utils/utils/utils';

import { type AddBootableVolumeState, type SetBootableVolumeFieldType } from '../../../types';

type RegistrySourceProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const RegistrySource: FC<RegistrySourceProps> = ({
  bootableVolume,
  setBootableVolumeField,
}): ReactElement => {
  const { t } = useKubevirtTranslation();
  const { registryCredentials = { password: '', username: '' }, registryURL = '' } = bootableVolume;

  const handleInputValueChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const trimmedValue = removeAllWhitespace(e.target.value);
    setBootableVolumeField('registryURL')(formatRegistryURL(trimmedValue));
  };

  const handleCredentialsChange = (updatedCreds: { password: string; username: string }): void => {
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
