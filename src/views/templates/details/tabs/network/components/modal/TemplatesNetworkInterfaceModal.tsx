import React, { FC, useCallback } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { produceTemplateNetwork } from '../../utils';

type TemplatesNetworkInterfaceModalProps = {
  headerText: string;
  isOpen: boolean;
  onClose: () => void;
  template: V1Template;
};

const TemplatesNetworkInterfaceModal: FC<TemplatesNetworkInterfaceModalProps> = ({
  headerText,
  isOpen,
  onClose,
  template,
}) => {
  const vm = getTemplateVirtualMachineObject(template);

  const onSubmit = useCallback(
    ({ interfaceMACAddress, interfaceModel, interfaceType, networkName, nicName }) =>
      () => {
        const resultNetwork = createNetwork(nicName, networkName);
        const resultInterface = createInterface(
          nicName,
          interfaceModel,
          interfaceMACAddress,
          interfaceType,
        );

        const updatedTemplate = produceTemplateNetwork(template, (draftVM) => {
          draftVM.spec.template.spec.domain.devices.interfaces.push(resultInterface);
          draftVM.spec.template.spec.networks.push(resultNetwork);
        });

        return k8sUpdate({
          data: updatedTemplate,
          model: TemplateModel,
          name: updatedTemplate?.metadata?.name,
          ns: updatedTemplate?.metadata?.namespace,
        });
      },
    [template],
  );

  return (
    <NetworkInterfaceModal
      headerText={headerText}
      isOpen={isOpen}
      namespace={template?.metadata?.namespace}
      onClose={onClose}
      onSubmit={onSubmit}
      vm={vm}
    />
  );
};

export default TemplatesNetworkInterfaceModal;
