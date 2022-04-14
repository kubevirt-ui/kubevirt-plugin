import * as React from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Form } from '@patternfly/react-core';

import { produceTemplateNetwork } from '../../utils';

import NameFormField from './components/NameFormField';
import NetworkInterfaceMACAddressInput from './components/NetworkInterfaceMacAddressInput';
import NetworkInterfaceModelSelect from './components/NetworkInterfaceModelSelect';
import NetworkInterfaceNetworkSelect from './components/NetworkInterfaceNetworkSelect';
import NetworkInterfaceTypeSelect from './components/NetworkInterfaceTypeSelect';
import { interfaceModelType, interfaceTypeTypes } from './utils/constants';
import { generateNicName, networkNameStartWithPod, podNetworkExists } from './utils/helpers';

type NetworkInterfaceModalProps = {
  template: V1Template;
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
};

const NetworkInterfaceModal: React.FC<NetworkInterfaceModalProps> = ({
  template,
  isOpen,
  onClose,
  headerText,
}) => {
  const vm = getTemplateVirtualMachineObject(template);
  const [nicName, setNicName] = React.useState(generateNicName());
  const [interfaceModel, setInterfaceModel] = React.useState(interfaceModelType.VIRTIO);
  const [networkName, setNetworkName] = React.useState(null);
  const [interfaceType, setInterfaceType] = React.useState(
    podNetworkExists(vm) ? interfaceTypeTypes.BRIDGE : interfaceTypeTypes.MASQUERADE,
  );
  const [interfaceMACAddress, setInterfaceMACAddress] = React.useState(undefined);

  const [submitDisabled, setSubmitDisabled] = React.useState(true);

  const onSubmit = React.useCallback(async () => {
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

    const updatedTemplate = produceTemplateNetwork(template, (draftVM) => {
      draftVM.spec.template.spec.domain.devices.interfaces.push(resultInterface);
      draftVM.spec.template.spec.networks.push(resultNetwork);
    });

    return k8sUpdate({
      model: TemplateModel,
      data: updatedTemplate,
      ns: updatedTemplate?.metadata?.namespace,
      name: updatedTemplate?.metadata?.name,
    });
  }, [interfaceMACAddress, interfaceModel, interfaceType, networkName, nicName, template]);

  return (
    <TabModal
      obj={template}
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
          template={template}
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
