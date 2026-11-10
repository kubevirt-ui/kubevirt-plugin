import { type ChangeEvent, type FC, useCallback } from 'react';
import { useController } from 'react-hook-form';

import ContainerSource from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeSource/components/ContainerSource';
import { REGISTRY_SOURCE_EXAMPLE_HELPER_TEXT } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { formatRegistryURL } from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFieldValidationState } from '@kubevirt-utils/utils/getFieldValidationState';
import { removeAllWhitespace } from '@kubevirt-utils/utils/utils';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';
import RegistrySchedulingFields from './RegistrySchedulingFields';

const RegistrySourceFields: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useBootableVolumeWizardForm();

  const {
    field: { onChange: onImageChange, value: image },
    fieldState: { error: imageError },
  } = useController({ control, name: 'imageSource.registry.image' });
  const {
    field: { onChange: onUsernameChange, value: username },
    fieldState: { error: usernameError },
  } = useController({ control, name: 'imageSource.registry.username' });
  const {
    field: { onChange: onPasswordChange, value: password },
  } = useController({
    control,
    name: 'imageSource.registry.password',
  });

  const { message: imageMessage, validated: imageValidated } = getFieldValidationState(imageError);
  const { message: usernameMessage, validated: usernameValidated } =
    getFieldValidationState(usernameError);

  const exampleHelperText = t(REGISTRY_SOURCE_EXAMPLE_HELPER_TEXT);

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const trimmedValue = removeAllWhitespace(event.target.value);
      onImageChange(formatRegistryURL(trimmedValue));
    },
    [onImageChange],
  );

  const setRegistryCredentials = useCallback(
    (credentials: { password: string; username: string }) => {
      onUsernameChange(credentials.username);
      onPasswordChange(credentials.password);
    },
    [onPasswordChange, onUsernameChange],
  );

  return (
    <>
      <ContainerSource
        containerImage={image ?? ''}
        imageHelperText={imageMessage ?? exampleHelperText}
        imageValidated={imageValidated}
        onInputValueChange={handleImageChange}
        registryCredentials={{
          password: password ?? '',
          username: username ?? '',
        }}
        registrySourceHelperText={exampleHelperText}
        selectedSourceType="registry"
        setRegistryCredentials={setRegistryCredentials}
        testId="volume-registry"
        usernameHelperText={usernameMessage}
        usernameValidated={usernameValidated}
      />
      <RegistrySchedulingFields />
    </>
  );
};

export default RegistrySourceFields;
