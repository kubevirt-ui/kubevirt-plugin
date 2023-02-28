import * as React from 'react';

import { produceVMNetworks, UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { Form } from '@patternfly/react-core';

import NameFormField from './components/NameFormField';
import NetworkInterfaceMACAddressInput from './components/NetworkInterfaceMacAddressInput';
import NetworkInterfaceModelSelect from './components/NetworkInterfaceModelSelect';
import NetworkInterfaceNetworkSelect from './components/NetworkInterfaceNetworkSelect';
import NetworkInterfaceTypeSelect from './components/NetworkInterfaceTypeSelect';
import { interfaceTypeTypes } from './utils/constants';
import { getNetworkName, networkNameStartWithPod } from './utils/helpers';

type EditNetworkInterfaceModalProps = {
  vm: V1VirtualMachine;
  updateVM: UpdateValidatedVM;
  isOpen: boolean;
  onClose: () => void;
  nicPresentation: NetworkPresentation;
};

const EditNetworkInterfaceModal: React.FC<EditNetworkInterfaceModalProps> = ({
  vm,
  updateVM,
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

  const onSubmit = (currentVM) => {
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

    const updatedInterfaces: V1Interface[] = [
      ...(getInterfaces(currentVM)?.filter(({ name }) => name !== network.name) || []),
      resultInterface,
    ];

    const updatedNetworks: V1Network[] = [
      ...(getNetworks(currentVM)?.filter(({ name }) => name !== network.name) || []),
      resultNetwork,
    ];

    const networkProducer = produceVMNetworks(currentVM, (draft) => {
      draft.spec.template.spec.domain.devices.interfaces = updatedInterfaces;
      draft.spec.template.spec.networks = updatedNetworks;
    });

    return updateVM(networkProducer);
  };

  return (
    <TabModal
      obj={vm}
      onSubmit={onSubmit}
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
          isDisabled={!networkName || networkNameStartWithPod(networkName)}
        />
      </Form>
    </TabModal>
  );
};

export default EditNetworkInterfaceModal;
