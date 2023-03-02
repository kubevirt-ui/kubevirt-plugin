import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { interfaceTypeTypes } from '../utils/constants';
import { networkNameStartWithPod } from '../utils/helpers';

type NetworkInterfaceTypeSelectProps = {
  interfaceType: string;
  setInterfaceType: Dispatch<SetStateAction<string>>;
  networkName: string | undefined;
};

const NetworkInterfaceTypeSelect: FC<NetworkInterfaceTypeSelectProps> = ({
  interfaceType,
  setInterfaceType,
  networkName,
}) => {
  const { t } = useKubevirtTranslation();

  const isPodNetworkName = useMemo(() => networkNameStartWithPod(networkName), [networkName]);
  const [isOpen, setIsOpen] = useState(false);

  const interfaceTypeOptions = {
    masquerade: {
      id: interfaceTypeTypes.MASQUERADE,
      name: t('Masquerade'),
      description: t(
        'Put the VirtualMachine behind a NAT Proxy for high compability with different network providers. The VirtualMachines IP will differ from the IP seen on the pod network',
      ),
      // in case of pod network, networkName is undefined
      allowOption: isPodNetworkName,
    },
    bridge: {
      id: interfaceTypeTypes.BRIDGE,
      name: t('Bridge'),
      description: t(
        'The VirtualMachine will be bridged to the selected network, ideal for L2 devices',
      ),
      // in case of NAD network, networkName should be a string
      allowOption: !isPodNetworkName,
    },
    sriov: {
      id: interfaceTypeTypes.SRIOV,
      name: t('SR-IOV'),
      description: t(
        'Attach a virtual function network device to the VirtualMachine for high performance',
      ),
      // in case of NAD network, networkName should be a string
      allowOption: !isPodNetworkName,
    },
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    setInterfaceType(value);
    setIsOpen(false);
  };

  return (
    <FormGroup label={t('Type')} fieldId="type">
      <div data-test-id="network-interface-type-select">
        <Select
          menuAppendTo="parent"
          isOpen={isOpen}
          onToggle={setIsOpen}
          onSelect={handleChange}
          variant={SelectVariant.single}
          selections={interfaceType}
        >
          {Object.values(interfaceTypeOptions)
            ?.filter(({ allowOption }) => allowOption)
            ?.map(({ id, name, description }) => (
              <SelectOption
                key={id}
                value={id}
                description={description}
                data-test-id={`network-interface-type-select-${id}`}
              >
                {name}
              </SelectOption>
            ))}
        </Select>
      </div>
    </FormGroup>
  );
};

export default NetworkInterfaceTypeSelect;
