import React, { Dispatch, FC, MouseEvent, SetStateAction, useMemo } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { interfacesTypes } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { FormGroup, SelectOption } from '@patternfly/react-core';

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
      name: t('Bridge'),
    },
    masquerade: {
      // in case of pod network, networkName is undefined
      allowOption: isPodNetworkName,
      description: t(
        'Put the VirtualMachine behind a NAT Proxy for high compatibility with different network providers. The VirtualMachines IP will differ from the IP seen on the pod network',
      ),
      id: interfacesTypes.masquerade,
      name: t('Masquerade'),
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
      name: t('SR-IOV'),
    },
  };

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    setInterfaceType(value);
  };

  return (
    <FormGroup fieldId="type" label={t('Type')}>
      <div data-test-id="network-interface-type-select">
        <FormPFSelect
          onSelect={handleChange}
          selected={interfaceType}
          toggleProps={{ isFullWidth: true }}
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
        </FormPFSelect>
        <FormGroupHelperText>
          {showTypeHelperText && t('Hot plug is enabled only for "Bridge" and "SR-IOV" types')}
        </FormGroupHelperText>
      </div>
    </FormGroup>
  );
};

export default NetworkInterfaceTypeSelect;
