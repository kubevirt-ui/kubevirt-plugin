import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { interfaceTypeTypes } from '../utils/constants';
import { networkNameStartWithPod } from '../utils/helpers';

type NetworkInterfaceTypeSelectProps = {
  interfaceType: string;
  setInterfaceType: React.Dispatch<React.SetStateAction<string>>;
  networkName: string | undefined;
};

const NetworkInterfaceTypeSelect: React.FC<NetworkInterfaceTypeSelectProps> = ({
  interfaceType,
  setInterfaceType,
  networkName,
}) => {
  const { t } = useKubevirtTranslation();

  const isPodNetworkName = React.useMemo(() => networkNameStartWithPod(networkName), [networkName]);
  const [isOpen, setIsOpen] = React.useState(false);

  const interfaceTypeOptions = {
    masquerade: {
      id: interfaceTypeTypes.MASQUERADE,
      name: t('Masquerade'),
      description: t(
        'Put the VM behind a NAT Proxy for high compability with different network providers. The VMs IP will differ from the IP seen on the pod network',
      ),
      // in case of pod network, networkName is undefined
      allowOption: isPodNetworkName,
    },
    bridge: {
      id: interfaceTypeTypes.BRIDGE,
      name: t('Bridge'),
      description: t('The VM will be bridged to the selected network, ideal for L2 devices'),
      // in case of NAD network, networkName should be a string
      allowOption: !isPodNetworkName,
    },
    sriov: {
      id: interfaceTypeTypes.SRIOV,
      name: t('SR-IOV'),
      description: t('Attach a virtual function network device to the VM for high performance'),
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
      <Select
        menuAppendTo="parent"
        isOpen={isOpen}
        onToggle={setIsOpen}
        onSelect={handleChange}
        variant={SelectVariant.single}
        selections={interfaceType}
      >
        {Object.values(interfaceTypeOptions)
          .filter(({ allowOption }) => allowOption)
          .map(({ id, name, description }) => (
            <SelectOption key={id} value={id} description={description}>
              {name}
            </SelectOption>
          ))}
      </Select>
    </FormGroup>
  );
};

export default NetworkInterfaceTypeSelect;
