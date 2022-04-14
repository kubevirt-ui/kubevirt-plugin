import * as React from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Form } from '@patternfly/react-core';

import { produceTemplateNetwork } from '../../utils';

import NameFormField from './components/NameFormField';
import NetworkInterfaceMACAddressInput from './components/NetworkInterfaceMacAddressInput';
import NetworkInterfaceModelSelect from './components/NetworkInterfaceModelSelect';
import NetworkInterfaceNetworkSelect from './components/NetworkInterfaceNetworkSelect';
import NetworkInterfaceTypeSelect from './components/NetworkInterfaceTypeSelect';
import { interfaceTypeTypes } from './utils/constants';
import { getNetworkName, networkNameStartWithPod } from './utils/helpers';

type EditNetworkInterfaceModalProps = {
  template: V1Template;
  isOpen: boolean;
  onClose: () => void;
  nicPresentation: NetworkPresentation;
};

const EditNetworkInterfaceModal: React.FC<EditNetworkInterfaceModalProps> = ({
  template,
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

  const onSubmit = async () => {
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
      draftVM.spec.template.spec.domain.devices.interfaces.filter(
        ({ name }) => name !== network.name,
      );
      draftVM.spec.template.spec.domain.devices.interfaces.push(resultInterface);

      draftVM.spec.template.spec.domain.devices.interfaces.filter(
        ({ name }) => name !== network.name,
      );

      draftVM.spec.template.spec.networks.push(resultNetwork);
    });

    return k8sUpdate({
      model: TemplateModel,
      data: updatedTemplate,
      ns: updatedTemplate?.metadata?.namespace,
      name: updatedTemplate?.metadata?.name,
    });
  };

  return (
    <TabModal
      obj={template}
      onSubmit={onSubmit}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Edit Network Interface')}
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
