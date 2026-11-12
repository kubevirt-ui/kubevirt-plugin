import {
  type Dispatch,
  type FC,
  type FormEvent,
  type FormEventHandler,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormPasswordInput } from '@kubevirt-utils/components/FormPasswordInput/FormPasswordInput';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, type ValidatedOptions } from '@patternfly/react-core';

import {
  resolveContainerImageHelperText,
  resolveValidatedOption,
} from './utils/containerSourceValidation';

type ContainerSourceProps = {
  containerImage?: string;
  imageHelperText?: ReactNode;
  imageValidated?: ValidatedOptions;
  onInputValueChange?: FormEventHandler<HTMLInputElement>;
  registryCredentials: { password: string; username: string };
  registrySourceHelperText: string;
  selectedSourceType: string;
  setRegistryCredentials: Dispatch<SetStateAction<{ password: string; username: string }>>;
  testId: string;
  usernameHelperText?: ReactNode;
  usernameValidated?: ValidatedOptions;
};

const ContainerSource: FC<ContainerSourceProps> = ({
  containerImage,
  imageHelperText,
  imageValidated,
  onInputValueChange,
  registryCredentials,
  registrySourceHelperText,
  selectedSourceType,
  setRegistryCredentials,
  testId,
  usernameHelperText,
  usernameValidated,
}): ReactElement => {
  const { t } = useKubevirtTranslation();
  const form = useFormContext();
  const isControlled = Boolean(onInputValueChange);
  const errors = !isControlled ? (form?.formState?.errors ?? {}) : {};
  const register = !isControlled ? form?.register : undefined;

  const hasImageError = Boolean(errors?.[`${testId}-containerImage`]);
  const resolvedImageValidated = resolveValidatedOption(imageValidated, hasImageError);
  const resolvedUsernameValidated = resolveValidatedOption(
    usernameValidated,
    Boolean(errors?.[`${testId}-username`]),
  );
  const resolvedImageHelperText = resolveContainerImageHelperText({
    hasImageError,
    imageHelperText,
    registrySourceHelperText,
    t,
  });

  const handleCredentialsChange = (
    e: FormEvent<HTMLInputElement>,
    field: 'password' | 'username',
  ): void => {
    setRegistryCredentials({ ...registryCredentials, [field]: e.currentTarget.value });
  };

  return (
    <>
      <FormGroup
        className="disk-source-form-group"
        fieldId={`${testId}-${selectedSourceType}`}
        isRequired
        label={t('Container image')}
      >
        <FormTextInput
          {...(register ? register(`${testId}-containerImage`, { required: true }) : {})}
          aria-label={t('Container image')}
          data-test={`${testId}-container-source-input`}
          id={`${testId}-${selectedSourceType}`}
          onChange={onInputValueChange}
          type="text"
          validated={resolvedImageValidated}
          value={register ? undefined : containerImage}
        />
        <FormGroupHelperText validated={resolvedImageValidated}>
          {resolvedImageHelperText}
        </FormGroupHelperText>
      </FormGroup>
      <FormGroup
        className="disk-source-form-group"
        fieldId={`${testId}-${selectedSourceType}-username`}
        label={t('Username')}
      >
        <FormTextInput
          {...(register ? register(`${testId}-username`) : {})}
          aria-label={t('Username')}
          data-test={`${testId}-container-source-username`}
          id={`${testId}-${selectedSourceType}-username`}
          onChange={(e) => handleCredentialsChange(e, 'username')}
          type="text"
          validated={resolvedUsernameValidated}
          value={register ? undefined : registryCredentials?.username}
        />
        {usernameHelperText && (
          <FormGroupHelperText validated={resolvedUsernameValidated}>
            {usernameHelperText}
          </FormGroupHelperText>
        )}
      </FormGroup>
      <FormGroup
        className="disk-source-form-group"
        fieldId={`${testId}-${selectedSourceType}-password`}
        label={t('Password')}
      >
        <FormPasswordInput
          {...(register ? register(`${testId}-password`) : {})}
          aria-label={t('Password')}
          data-test={`${testId}-container-source-password`}
          id={`${testId}-${selectedSourceType}`}
          onChange={(e) => handleCredentialsChange(e, 'password')}
          type="text"
          validated={resolveValidatedOption(undefined, Boolean(errors?.[`${testId}-password`]))}
          value={register ? undefined : registryCredentials?.password}
        />
      </FormGroup>
    </>
  );
};

export default ContainerSource;
