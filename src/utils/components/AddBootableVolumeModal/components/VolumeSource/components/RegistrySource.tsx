import { type ChangeEvent, type FC, type ReactElement } from 'react';

import ContainerSource from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeSource/components/ContainerSource';
import { REGISTRY_SOURCE_EXAMPLE_HELPER_TEXT } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { formatRegistryURL } from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { removeAllWhitespace } from '@kubevirt-utils/utils/utils';

import { type AddBootableVolumeState, type SetBootableVolumeFieldType } from '../../../types';
import DiskSourceUploadISO from './DiskSourceUploadISO';

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
    <>
      <ContainerSource
        containerImage={registryURL}
        onInputValueChange={handleInputValueChange}
        registryCredentials={registryCredentials}
        registrySourceHelperText={t(REGISTRY_SOURCE_EXAMPLE_HELPER_TEXT)}
        selectedSourceType="registry"
        setRegistryCredentials={handleCredentialsChange}
        testId="volume-registry"
      />
      <DiskSourceUploadISO
        bootableVolume={bootableVolume}
        setBootableVolumeField={setBootableVolumeField}
      />
    </>
  );
};

export default RegistrySource;
