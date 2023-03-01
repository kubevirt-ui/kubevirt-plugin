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
  nicName: string;
  networkName: string;
  interfaceModel: string;
  interfaceMACAddress: string;
  interfaceType: string;
};

type NetworkInterfaceModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  Header?: ReactNode;
  headerText: string;
  namespace?: string;
  nicPresentation?: NetworkPresentation;
  onSubmit: (
    args: NetworkInterfaceModalOnSubmit,
  ) => (
    obj: V1VirtualMachine,
  ) => Promise<void | V1VirtualMachine | V1VirtualMachine[] | V1Template | V1Template[]>;
};

const NetworkInterfaceModal: FC<NetworkInterfaceModalProps> = ({
  onSubmit,
  vm,
  isOpen,
  onClose,
  Header,
  headerText,
  namespace,
  nicPresentation = { network: null, iface: null },
}) => {
  const { network = null, iface = null } = nicPresentation;
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
      onSubmit({ nicName, networkName, interfaceModel, interfaceMACAddress, interfaceType })
    );
  }, [nicName, networkName, interfaceModel, interfaceMACAddress, interfaceType, onSubmit]);

  return (
    <TabModal<K8sResourceCommon>
      obj={vm}
      onSubmit={onSubmitModal()}
      isOpen={isOpen}
      onClose={onClose}
      headerText={headerText}
      isDisabled={submitDisabled}
    >
      <Form>
        {Header}
        <NameFormField objName={nicName} setObjName={setNicName} />
        <NetworkInterfaceModelSelect
          interfaceModel={interfaceModel}
          setInterfaceModel={setInterfaceModel}
        />
        <NetworkInterfaceNetworkSelect
          vm={vm}
          networkName={networkName}
          setNetworkName={setNetworkName}
          setInterfaceType={setInterfaceType}
          setSubmitDisabled={setSubmitDisabled}
          namespace={namespace}
        />
        <NetworkInterfaceTypeSelect
          interfaceType={interfaceType}
          setInterfaceType={setInterfaceType}
          networkName={networkName}
        />
        <NetworkInterfaceMACAddressInput
          interfaceMACAddress={interfaceMACAddress}
          setInterfaceMACAddress={setInterfaceMACAddress}
          setIsError={setSubmitDisabled}
          isDisabled={!networkName || networkNameStartWithPod(networkName)}
        />
      </Form>
    </TabModal>
  );
};

export default NetworkInterfaceModal;
