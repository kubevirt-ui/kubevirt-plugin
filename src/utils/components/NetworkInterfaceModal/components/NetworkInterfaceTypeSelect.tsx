import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { interfaceTypeTypes } from '../utils/constants';
import { networkNameStartWithPod } from '../utils/helpers';

type NetworkInterfaceTypeSelectProps = {
  interfaceType: string;
  networkName: string | undefined;
  setInterfaceType: Dispatch<SetStateAction<string>>;
};

const NetworkInterfaceTypeSelect: FC<NetworkInterfaceTypeSelectProps> = ({
  interfaceType,
  networkName,
  setInterfaceType,
}) => {
  const { t } = useKubevirtTranslation();

  const isPodNetworkName = useMemo(() => networkNameStartWithPod(networkName), [networkName]);
  const [isOpen, setIsOpen] = useState(false);

  const interfaceTypeOptions = {
    bridge: {
      // in case of NAD network, networkName should be a string
      allowOption: !isPodNetworkName,
      description: t(
        'The VirtualMachine will be bridged to the selected network, ideal for L2 devices',
      ),
      id: interfaceTypeTypes.BRIDGE,
      name: t('Bridge'),
    },
    masquerade: {
      // in case of pod network, networkName is undefined
      allowOption: isPodNetworkName,
      description: t(
        'Put the VirtualMachine behind a NAT Proxy for high compability with different network providers. The VirtualMachines IP will differ from the IP seen on the pod network',
      ),
      id: interfaceTypeTypes.MASQUERADE,
      name: t('Masquerade'),
    },
    sriov: {
      // in case of NAD network, networkName should be a string
      allowOption: !isPodNetworkName,
      description: t(
        'Attach a virtual function network device to the VirtualMachine for high performance',
      ),
      id: interfaceTypeTypes.SRIOV,
      name: t('SR-IOV'),
    },
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    setInterfaceType(value);
    setIsOpen(false);
  };

  return (
    <FormGroup fieldId="type" label={t('Type')}>
      <div data-test-id="network-interface-type-select">
        <Select
          isOpen={isOpen}
          menuAppendTo="parent"
          onSelect={handleChange}
          onToggle={setIsOpen}
          selections={interfaceType}
          variant={SelectVariant.single}
        >
          {Object.values(interfaceTypeOptions)
            ?.filter(({ allowOption }) => allowOption)
            ?.map(({ description, id, name }) => (
              <SelectOption
                data-test-id={`network-interface-type-select-${id}`}
                description={description}
                key={id}
                value={id}
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
