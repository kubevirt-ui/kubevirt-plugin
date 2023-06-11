import React, { FC, ReactNode, useCallback, useState } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Form } from '@patternfly/react-core';

import NameFormField from './components/NameFormField';
import NetworkInterfaceMACAddressInput from './components/NetworkInterfaceMacAddressInput';
import NetworkInterfaceModelSelect from './components/NetworkInterfaceModelSelect';
import NetworkInterfaceNetworkSelect from './components/NetworkInterfaceNetworkSelect';
import NetworkInterfaceTypeSelect from './components/NetworkInterfaceTypeSelect';
import { interfaceModelType, interfaceTypeTypes } from './utils/constants';
import {
  generateNicName,
  getNetworkName,
  networkNameStartWithPod,
  podNetworkExists,
} from './utils/helpers';

type NetworkInterfaceModalOnSubmit = {
  interfaceMACAddress: string;
  interfaceModel: string;
  interfaceType: string;
  networkName: string;
  nicName: string;
};

type NetworkInterfaceModalProps = {
  fixedName?: boolean;
  Header?: ReactNode;
  headerText: string;
  isOpen: boolean;
  namespace?: string;
  nicPresentation?: NetworkPresentation;
  onClose: () => void;
  onSubmit: (
    args: NetworkInterfaceModalOnSubmit,
  ) => (
    obj: V1VirtualMachine,
  ) => Promise<V1Template | V1Template[] | V1VirtualMachine | V1VirtualMachine[] | void>;
  vm: V1VirtualMachine;
};

const NetworkInterfaceModal: FC<NetworkInterfaceModalProps> = ({
  fixedName = false,
  Header,
  headerText,
  isOpen,
  namespace,
  nicPresentation = { iface: null, network: null },
  onClose,
  onSubmit,
  vm,
}) => {
  const { iface = null, network = null } = nicPresentation;
  const [nicName, setNicName] = useState(network?.name || generateNicName());
  const [interfaceModel, setInterfaceModel] = useState(iface?.model || interfaceModelType.VIRTIO);
  const [networkName, setNetworkName] = useState(getNetworkName(network));
  const [interfaceType, setInterfaceType] = useState(
    interfaceTypeTypes[getNetworkInterfaceType(iface).toUpperCase()] ||
      (podNetworkExists(vm) ? interfaceTypeTypes.BRIDGE : interfaceTypeTypes.MASQUERADE),
  );
  const [interfaceMACAddress, setInterfaceMACAddress] = useState(iface?.macAddress);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const onSubmitModal = useCallback(() => {
    return (
      onSubmit &&
      onSubmit({ interfaceMACAddress, interfaceModel, interfaceType, networkName, nicName })
    );
  }, [nicName, networkName, interfaceModel, interfaceMACAddress, interfaceType, onSubmit]);

  return (
    <TabModal<K8sResourceCommon>
      headerText={headerText}
      isDisabled={submitDisabled}
      isOpen={isOpen}
      obj={vm}
      onClose={onClose}
      onSubmit={onSubmitModal()}
    >
      <Form>
        {Header}
        <NameFormField isDisabled={fixedName} objName={nicName} setObjName={setNicName} />
        <NetworkInterfaceModelSelect
          interfaceModel={interfaceModel}
          setInterfaceModel={setInterfaceModel}
        />
        <NetworkInterfaceNetworkSelect
          isEditing={Boolean(network) && Boolean(iface)}
          namespace={namespace}
          networkName={networkName}
          setInterfaceType={setInterfaceType}
          setNetworkName={setNetworkName}
          setSubmitDisabled={setSubmitDisabled}
          vm={vm}
        />
        <NetworkInterfaceTypeSelect
          interfaceType={interfaceType}
          networkName={networkName}
          setInterfaceType={setInterfaceType}
        />
        <NetworkInterfaceMACAddressInput
          interfaceMACAddress={interfaceMACAddress}
          isDisabled={!networkName || networkNameStartWithPod(networkName)}
          setInterfaceMACAddress={setInterfaceMACAddress}
          setIsError={setSubmitDisabled}
        />
      </Form>
    </TabModal>
  );
};

export default NetworkInterfaceModal;
