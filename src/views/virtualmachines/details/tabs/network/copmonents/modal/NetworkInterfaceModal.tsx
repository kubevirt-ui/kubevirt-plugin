import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Form } from '@patternfly/react-core';

import NameFormField from '../../../form/NameFormField';

import NetworkInterfaceMACAddressInput from './NetworkInterfaceFormFields/NetworkInterfaceMacAddressInput';
import NetworkInterfaceModelSelect from './NetworkInterfaceFormFields/NetworkInterfaceModelSelect';
import NetworkInterfaceNetworkSelect from './NetworkInterfaceFormFields/NetworkInterfaceNetworkSelect';
import NetworkInterfaceTypeSelect from './NetworkInterfaceFormFields/NetworkInterfaceTypeSelect';
import { interfaceModelType, interfaceTypeTypes } from './utils/constants';
import {
  generateNicName,
  networkNameStartWithPod,
  podNetworkExists,
  updateVMNetworkInterface,
} from './utils/helpers';

type NetworkInterfaceModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
};

const NetworkInterfaceModal: React.FC<NetworkInterfaceModalProps> = ({
  vm,
  isOpen,
  onClose,
  headerText,
}) => {
  const [nicName, setNicName] = React.useState(generateNicName());
  const [interfaceModel, setInterfaceModel] = React.useState(interfaceModelType.VIRTIO);
  const [networkName, setNetworkName] = React.useState(null);
  const [interfaceType, setInterfaceType] = React.useState(
    podNetworkExists(vm) ? interfaceTypeTypes.BRIDGE : interfaceTypeTypes.MASQUERADE,
  );
  const [interfaceMACAddress, setInterfaceMACAddress] = React.useState(undefined);

  const [submitDisabled, setSubmitDisabled] = React.useState(true);

  const resultVirtualMachine = React.useMemo(() => {
    const resultNetwork: V1Network = {
      name: nicName,
    };
    if (!networkNameStartWithPod(networkName) && networkName) {
      resultNetwork.multus = { networkName };
    } else {
      resultNetwork.pod = {};
    }

    const updatedNetworks: V1Network[] = [...getNetworks(vm), resultNetwork];

    const resultInterface: V1Interface = {
      name: nicName,
      model: interfaceModel,
      macAddress: interfaceMACAddress,
    };

    if (interfaceType === interfaceTypeTypes.BRIDGE) {
      resultInterface.bridge = {};
    } else if (interfaceType === interfaceTypeTypes.MASQUERADE) {
      resultInterface.masquerade = {};
    } else if (interfaceType === interfaceTypeTypes.SRIOV) {
      resultInterface.sriov = {};
    }

    const updatedInterfaces: V1Interface[] = [...getInterfaces(vm), resultInterface];

    return updateVMNetworkInterface(vm, updatedNetworks, updatedInterfaces);
  }, [interfaceMACAddress, interfaceModel, interfaceType, networkName, nicName, vm]);

  return (
    <TabModal
      obj={resultVirtualMachine}
      onSubmit={(obj) =>
        k8sUpdate({
          model: VirtualMachineModel,
          data: obj,
          ns: obj.metadata.namespace,
          name: obj.metadata.name,
        })
      }
      isOpen={isOpen}
      onClose={onClose}
      headerText={headerText}
      isDisabled={submitDisabled}
    >
      <Form>
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
