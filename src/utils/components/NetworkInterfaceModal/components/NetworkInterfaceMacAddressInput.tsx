import React, {
  type Dispatch,
  type FC,
  type FormEvent,
  type SetStateAction,
  useState,
} from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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

  const handleNameChange = (value: string, event: FormEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const error = validateMACAddress(t, value);
    setIsError(!!error);
    setNameError(error);
    setInterfaceMACAddress(value);
  };

  const validated = nameError ? ValidatedOptions.error : ValidatedOptions.default;
  return (
    <FormGroup className="form-group-margin" fieldId="mac-address" label={t('MAC address')}>
      <TextInput
        id="mac-address"
        isDisabled={isDisabled}
        onChange={(event, value: string) => handleNameChange(value, event)}
        type="text"
        value={interfaceMACAddress}
      />
      <FormGroupHelperText validated={validated}>{nameError}</FormGroupHelperText>
    </FormGroup>
  );
};

export default NetworkInterfaceMacAddressInput;
