import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { validateMACAddress } from '../utils/mac-validation';

type NetworkInterfaceMACAddressInputProps = {
  interfaceMACAddress: string;
  setInterfaceMACAddress: React.Dispatch<React.SetStateAction<string>>;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
  isDisabled: boolean;
};

const NetworkInterfaceMACAddressInput: React.FC<NetworkInterfaceMACAddressInputProps> = ({
  interfaceMACAddress,
  setInterfaceMACAddress,
  setIsError,
  isDisabled,
}) => {
  const { t } = useKubevirtTranslation();

  const [nameError, setNameError] = React.useState(undefined);

  const handleNameChange = (value: string, event: React.FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    const error = validateMACAddress(value, t);
    setIsError(!!error);
    setNameError(error);
    setInterfaceMACAddress(value);
  };

  return (
    <FormGroup
      label={t('MAC address')}
      fieldId="mac-address"
      helperTextInvalid={nameError}
      helperTextInvalidIcon={nameError && <RedExclamationCircleIcon title={t('Error')} />}
      validated={nameError ? ValidatedOptions.error : ValidatedOptions.default}
    >
      <TextInput
        type="text"
        value={interfaceMACAddress}
        onChange={handleNameChange}
        id="mac-address"
        isDisabled={isDisabled}
      />
    </FormGroup>
  );
};

export default NetworkInterfaceMACAddressInput;
