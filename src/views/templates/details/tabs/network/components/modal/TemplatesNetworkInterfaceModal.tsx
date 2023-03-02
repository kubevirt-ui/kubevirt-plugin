import React, { FC, useCallback } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import SharedNetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { produceTemplateNetwork } from '../../utils';

type TemplatesNetworkInterfaceModalProps = {
  template: V1Template;
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
};

const TemplatesNetworkInterfaceModal: FC<TemplatesNetworkInterfaceModalProps> = ({
  template,
  isOpen,
  onClose,
  headerText,
}) => {
  const vm = getTemplateVirtualMachineObject(template);

  const onSubmit = useCallback(
    ({ nicName, networkName, interfaceModel, interfaceMACAddress, interfaceType }) =>
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
          model: TemplateModel,
          data: updatedTemplate,
          ns: updatedTemplate?.metadata?.namespace,
          name: updatedTemplate?.metadata?.name,
        });
      },
    [template],
  );

  return (
    <SharedNetworkInterfaceModal
      vm={vm}
      namespace={template?.metadata?.namespace}
      onSubmit={onSubmit}
      headerText={headerText}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default TemplatesNetworkInterfaceModal;
