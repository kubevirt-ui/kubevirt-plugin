import React, { Dispatch, FC, FormEvent, SetStateAction, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { validateMACAddress } from '../utils/mac-validation';

type NetworkInterfaceMacAddressInputProps = {
  interfaceMACAddress: string;
  isDisabled: boolean;
  setInterfaceMACAddress: Dispatch<SetStateAction<string>>;
  setIsError: Dispatch<SetStateAction<boolean>>;
};

const NetworkInterfaceMacAddressInput: FC<NetworkInterfaceMacAddressInputProps> = ({
  interfaceMACAddress,
  isDisabled,
  setInterfaceMACAddress,
  setIsError,
}) => {
  const { t } = useKubevirtTranslation();

  const [nameError, setNameError] = useState(undefined);

  const handleNameChange = (value: string, event: FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    const error = validateMACAddress(value);
    setIsError(!!error);
    setNameError(error);
    setInterfaceMACAddress(value);
  };

  return (
    <FormGroup
      fieldId="mac-address"
      helperTextInvalid={nameError}
      helperTextInvalidIcon={nameError && <RedExclamationCircleIcon title={t('Error')} />}
      label={t('MAC address')}
      validated={nameError ? ValidatedOptions.error : ValidatedOptions.default}
    >
      <TextInput
        id="mac-address"
        isDisabled={isDisabled}
        onChange={handleNameChange}
        type="text"
        value={interfaceMACAddress}
      />
    </FormGroup>
  );
};

export default NetworkInterfaceMacAddressInput;
