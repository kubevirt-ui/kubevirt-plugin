import React, { FC } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { produceTemplateNetwork } from '../../utils';

type TemplatesEditNetworkInterfaceModalProps = {
  isOpen: boolean;
  nicPresentation: NetworkPresentation;
  onClose: () => void;
  template: V1Template;
};

const TemplatesEditNetworkInterfaceModal: FC<TemplatesEditNetworkInterfaceModalProps> = ({
  isOpen,
  nicPresentation,
  onClose,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const vm = getTemplateVirtualMachineObject(template);

  const onSubmit =
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
        draftVM.spec.template.spec.domain.devices.interfaces = [
          ...(draftVM.spec.template.spec.domain.devices.interfaces.filter(
            ({ name }) => name !== nicPresentation?.network?.name,
          ) || []),
          resultInterface,
        ];

        draftVM.spec.template.spec.networks = [
          ...(draftVM.spec.template.spec.networks.filter(
            ({ name }) => name !== nicPresentation?.network?.name,
          ) || []),
          resultNetwork,
        ];
      });

      return k8sUpdate({
        data: updatedTemplate,
        model: TemplateModel,
        name: updatedTemplate?.metadata?.name,
        ns: updatedTemplate?.metadata?.namespace,
      });
    };

  return (
    <NetworkInterfaceModal
      headerText={t('Edit network interface')}
      isOpen={isOpen}
      namespace={template?.metadata?.namespace}
      nicPresentation={nicPresentation}
      onClose={onClose}
      onSubmit={onSubmit}
      vm={vm}
    />
  );
};

export default TemplatesEditNetworkInterfaceModal;
