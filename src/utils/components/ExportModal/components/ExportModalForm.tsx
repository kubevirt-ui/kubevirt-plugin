import React, { type FC } from 'react';

import { FormPasswordInput } from '@kubevirt-utils/components/FormPasswordInput/FormPasswordInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, StackItem, TextInput } from '@patternfly/react-core';

type ExportModalFormProps = {
  destination: string;
  isDisabled: boolean;
  password: string;
  registryName: string;
  setDestination: (value: string) => void;
  setPassword: (value: string) => void;
  setRegistryName: (value: string) => void;
  setUsername: (value: string) => void;
  username: string;
};

const ExportModalForm: FC<ExportModalFormProps> = ({
  destination,
  isDisabled,
  password,
  registryName,
  setDestination,
  setPassword,
  setRegistryName,
  setUsername,
  username,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <StackItem>
        <FormGroup fieldId="registryName" isRequired label={t('Name')}>
          <TextInput
            id="registryName"
            isDisabled={isDisabled}
            onChange={(_event, value: string) => setRegistryName(value)}
            type="text"
            value={registryName}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup fieldId="destination" isRequired label={t('Destination')}>
          <TextInput
            id="destination"
            isDisabled={isDisabled}
            onChange={(_event, value: string) => setDestination(value)}
            type="text"
            value={destination}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup fieldId="username" isRequired label={t('Username')}>
          <TextInput
            id="username"
            isDisabled={isDisabled}
            onChange={(_event, value: string) => setUsername(value)}
            type="text"
            value={username}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup fieldId="password" isRequired label={t('Password')}>
          <FormPasswordInput
            onChange={(event) => setPassword((event.target as HTMLInputElement).value)}
            id="password"
            isDisabled={isDisabled}
            value={password}
          />
        </FormGroup>
      </StackItem>
    </>
  );
};

export default ExportModalForm;
