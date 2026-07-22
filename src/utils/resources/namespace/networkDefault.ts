import { type V1Interface, type V1Network } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  createInterface,
  createNetwork,
  getNadType,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  DEFAULT_NETWORK,
  DEFAULT_NETWORK_INTERFACE,
  POD_NETWORK,
  UDN_BINDING_NAME,
} from '@kubevirt-utils/resources/vm';

type NetworkSelectOption = {
  value: string;
};

export const resolveProjectDefaultNetworkSelectValue = (
  isPodNetworkAllowed: boolean,
  networkOptions: NetworkSelectOption[],
): string | undefined => {
  if (!networkOptions?.length) {
    return undefined;
  }

  if (isPodNetworkAllowed) {
    const podOption = networkOptions.find((option) => option.value === POD_NETWORK);
    return podOption?.value ?? networkOptions?.[0]?.value;
  }

  return (
    networkOptions.find((option) => option.value !== POD_NETWORK)?.value ??
    networkOptions?.[0]?.value
  );
};

type BuildDefaultNetworkInterfaceArgs = {
  isUDNManagedNamespace?: boolean;
  vmCreationNad?: NetworkAttachmentDefinitionKind;
};

export const buildDefaultNetworkInterface = ({
  isUDNManagedNamespace,
  vmCreationNad,
}: BuildDefaultNetworkInterfaceArgs): V1Interface => {
  if (isUDNManagedNamespace) {
    return {
      binding: { name: UDN_BINDING_NAME },
      name: DEFAULT_NETWORK_INTERFACE.name,
    } as V1Interface;
  }

  if (!vmCreationNad) {
    return DEFAULT_NETWORK_INTERFACE;
  }

  return createInterface({
    interfaceMACAddress: '',
    interfaceModel: 'virtio',
    interfaceType: getNadType(vmCreationNad),
    nicName: DEFAULT_NETWORK_INTERFACE.name,
  });
};

type BuildDefaultNetworkArgs = {
  vmCreationNad?: NetworkAttachmentDefinitionKind;
};

export const buildDefaultNetwork = ({ vmCreationNad }: BuildDefaultNetworkArgs): V1Network => {
  if (!vmCreationNad) {
    return DEFAULT_NETWORK;
  }

  const vmCreationNadName = getName(vmCreationNad);

  return createNetwork(DEFAULT_NETWORK_INTERFACE.name, vmCreationNadName);
};
