import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type NetworkInterfaceMACAddressInputProps = {
  interfaceMACAddress: string;
  setInterfaceMACAddress: React.Dispatch<React.SetStateAction<string>>;
  isDisabled: boolean;
};

const NetworkInterfaceMACAddressInput: React.FC<NetworkInterfaceMACAddressInputProps> = ({
  interfaceMACAddress,
  setInterfaceMACAddress,
  isDisabled,
}) => {
  const { t } = useKubevirtTranslation();

  const handleNameChange = (value: string, event: React.FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    setInterfaceMACAddress(value);
  };

  return (
    <FormGroup label={t('MAC address')} fieldId="mac-address">
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
