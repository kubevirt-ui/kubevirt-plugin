import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { interfacesTypes, typeLabels } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { networkNameStartWithPod } from '../utils/helpers';

type NetworkInterfaceTypeSelectProps = {
  interfaceType: string;
  networkName: string | undefined;
  setInterfaceType: Dispatch<SetStateAction<string>>;
  showTypeHelperText?: boolean;
};

const NetworkInterfaceTypeSelect: FC<NetworkInterfaceTypeSelectProps> = ({
  interfaceType,
  networkName,
  setInterfaceType,
  showTypeHelperText,
}) => {
  const { t } = useKubevirtTranslation();
  const isPodNetworkName = useMemo(() => networkNameStartWithPod(networkName), [networkName]);
  const [isOpen, setIsOpen] = useState(false);

  const interfaceTypeOptions = {
    bridge: {
      // in case of NAD network, networkName should be a string - enabled if nad type is bridge or undefined or no nad
      allowOption:
        !isPodNetworkName &&
        (interfaceType === interfacesTypes.bridge || !interfaceType || !networkName),
      description: t(
        'The VirtualMachine will be bridged to the selected network, ideal for L2 devices',
      ),
      id: interfacesTypes.bridge,
      name: typeLabels[interfacesTypes.bridge],
    },
    masquerade: {
      // in case of pod network, networkName is undefined
      allowOption: isPodNetworkName,
      description: t(
        'Put the VirtualMachine behind a NAT Proxy for high compatibility with different network providers. The VirtualMachines IP will differ from the IP seen on the pod network',
      ),
      id: interfacesTypes.masquerade,
      name: typeLabels[interfacesTypes.masquerade],
    },
    sriov: {
      // in case of NAD network, networkName should be a string - enabled if nad type is sriov or undefined or no nad
      allowOption:
        !isPodNetworkName &&
        (interfaceType === interfacesTypes.sriov || !interfaceType || !networkName),
      description: t(
        'Attach a virtual function network device to the VirtualMachine for high performance',
      ),
      id: interfacesTypes.sriov,
      name: typeLabels[interfacesTypes.sriov],
    },
  };

  return (
    <FormGroup
      fieldId="type"
      helperText={showTypeHelperText && t('Hot plug is enabled only for "Bridge" type')}
      label={t('Type')}
    >
      <div data-test-id="network-interface-type-select">
        <Select
          isOpen={isOpen}
          menuAppendTo="parent"
          onSelect={() => setIsOpen(false)}
          onToggle={setIsOpen}
          selections={typeLabels[interfaceType] || typeLabels.bridge}
          variant={SelectVariant.single}
        >
          {Object.values(interfaceTypeOptions)
            ?.filter(({ allowOption }) => allowOption)
            ?.map(({ description, id, name }) => (
              <SelectOption
                data-test-id={`network-interface-type-select-${id}`}
                description={description}
                key={id}
                onClick={() => setInterfaceType(id)}
                value={name}
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
