import React, { FC, useCallback } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { getName } from '@kubevirt-utils/resources/shared';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

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
    ({
        interfaceLinkState,
        interfaceMACAddress,
        interfaceModel,
        interfaceType,
        networkName,
        nicName,
      }) =>
      () => {
        const resultNetwork = createNetwork(nicName, networkName);
        const resultInterface = createInterface({
          interfaceLinkState,
          interfaceMACAddress,
          interfaceModel,
          interfaceType,
          nicName,
        });

        const updatedTemplate = produceTemplateNetwork(template, (draftVM) => {
          draftVM.spec.template.spec.domain.devices.interfaces.push(resultInterface);
          draftVM.spec.template.spec.networks.push(resultNetwork);
        });

        return kubevirtK8sUpdate({
          cluster: getCluster(template),
          data: updatedTemplate,
          model: TemplateModel,
          name: getName(updatedTemplate),
          ns: getNamespace(updatedTemplate),
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
