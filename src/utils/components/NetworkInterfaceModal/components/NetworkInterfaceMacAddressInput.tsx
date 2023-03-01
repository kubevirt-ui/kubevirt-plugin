import React, { Dispatch, FC, FormEvent, SetStateAction, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { validateMACAddress } from '../utils/mac-validation';

type NetworkInterfaceMacAddressInputProps = {
  interfaceMACAddress: string;
  setInterfaceMACAddress: Dispatch<SetStateAction<string>>;
  setIsError: Dispatch<SetStateAction<boolean>>;
  isDisabled: boolean;
};

const NetworkInterfaceMacAddressInput: FC<NetworkInterfaceMacAddressInputProps> = ({
  interfaceMACAddress,
  setInterfaceMACAddress,
  setIsError,
  isDisabled,
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

export default NetworkInterfaceMacAddressInput;
