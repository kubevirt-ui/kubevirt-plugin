import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Form } from '@patternfly/react-core';
import NameFormField from '@virtualmachines/details/tabs/form/NameFormField';

import NetworkInterfaceMACAddressInput from './NetworkInterfaceFormFields/NetworkInterfaceMacAddressInput';
import NetworkInterfaceModelSelect from './NetworkInterfaceFormFields/NetworkInterfaceModelSelect';
import NetworkInterfaceNetworkSelect from './NetworkInterfaceFormFields/NetworkInterfaceNetworkSelect';
import NetworkInterfaceTypeSelect from './NetworkInterfaceFormFields/NetworkInterfaceTypeSelect';
import { interfaceTypeTypes } from './utils/constants';
import { getNetworkName, networkNameStartWithPod, updateVMNetworkInterface } from './utils/helpers';

type EditNetworkInterfaceModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  nicPresentation: NetworkPresentation;
};

const EditNetworkInterfaceModal: React.FC<EditNetworkInterfaceModalProps> = ({
  vm,
  isOpen,
  onClose,
  nicPresentation,
}) => {
  const { t } = useKubevirtTranslation();
  const { network, iface } = nicPresentation;
  const [nicName, setNicName] = React.useState(network.name);
  const [interfaceModel, setInterfaceModel] = React.useState(iface.model);
  const [networkName, setNetworkName] = React.useState(getNetworkName(network, t));
  const [interfaceType, setInterfaceType] = React.useState(
    interfaceTypeTypes[getNetworkInterfaceType(iface).toUpperCase()],
  );

  const [interfaceMACAddress, setInterfaceMACAddress] = React.useState(iface.macAddress);

  const [submitDisabled, setSubmitDisabled] = React.useState(true);

  const updatedVirtualMachine = React.useMemo(() => {
    const resultNetwork: V1Network = {
      name: nicName,
    };
    if (!networkNameStartWithPod(networkName) && networkName) {
      resultNetwork.multus = { networkName };
    } else {
      resultNetwork.pod = {};
    }

    const updatedNetworks: V1Network[] = [
      ...(getNetworks(vm)?.filter(({ name }) => name !== network.name) || []),
      resultNetwork,
    ];

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

    const updatedInterfaces: V1Interface[] = [
      ...(getInterfaces(vm)?.filter(({ name }) => name !== network.name) || []),
      resultInterface,
    ];

    return updateVMNetworkInterface(vm, updatedNetworks, updatedInterfaces);
  }, [interfaceMACAddress, interfaceModel, interfaceType, network.name, networkName, nicName, vm]);

  return (
    <TabModal
      obj={updatedVirtualMachine}
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
      headerText={t('Edit network interface')}
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
          isEditing
          editInitValueNetworkName={getNetworkName(network, t)}
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

export default EditNetworkInterfaceModal;
