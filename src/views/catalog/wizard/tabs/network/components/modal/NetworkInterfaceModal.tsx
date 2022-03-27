import * as React from 'react';

import { produceVMNetworks, UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { Form } from '@patternfly/react-core';

import NameFormField from './components/NameFormField';
import NetworkInterfaceMACAddressInput from './components/NetworkInterfaceMacAddressInput';
import NetworkInterfaceModelSelect from './components/NetworkInterfaceModelSelect';
import NetworkInterfaceNetworkSelect from './components/NetworkInterfaceNetworkSelect';
import NetworkInterfaceTypeSelect from './components/NetworkInterfaceTypeSelect';
import { interfaceModelType, interfaceTypeTypes } from './utils/constants';
import { generateNicName, networkNameStartWithPod, podNetworkExists } from './utils/helpers';

type NetworkInterfaceModalProps = {
  vm: V1VirtualMachine;
  updateVM: UpdateValidatedVM;
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
};

const NetworkInterfaceModal: React.FC<NetworkInterfaceModalProps> = ({
  vm,
  updateVM,
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

  const onSubmit = React.useCallback(
    (currentVM) => {
      const resultNetwork: V1Network = {
        name: nicName,
      };
      if (!networkNameStartWithPod(networkName) && networkName) {
        resultNetwork.multus = { networkName };
      } else {
        resultNetwork.pod = {};
      }

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

      const networkProducer = produceVMNetworks(currentVM, (draft) => {
        draft.spec.template.spec.domain.devices.interfaces.push(resultInterface);
        draft.spec.template.spec.networks.push(resultNetwork);
      });

      return updateVM(networkProducer);
    },
    [interfaceMACAddress, interfaceModel, interfaceType, networkName, nicName, updateVM],
  );

  return (
    <TabModal
      obj={vm}
      onSubmit={onSubmit}
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
          isDisabled={!networkName || networkNameStartWithPod(networkName)}
        />
      </Form>
    </TabModal>
  );
};

export default NetworkInterfaceModal;
