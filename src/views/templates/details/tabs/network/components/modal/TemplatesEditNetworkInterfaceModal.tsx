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
  template: V1Template;
  isOpen: boolean;
  onClose: () => void;
  nicPresentation: NetworkPresentation;
};

const TemplatesEditNetworkInterfaceModal: FC<TemplatesEditNetworkInterfaceModalProps> = ({
  template,
  isOpen,
  onClose,
  nicPresentation,
}) => {
  const { t } = useKubevirtTranslation();
  const vm = getTemplateVirtualMachineObject(template);

  const onSubmit =
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
        model: TemplateModel,
        data: updatedTemplate,
        ns: updatedTemplate?.metadata?.namespace,
        name: updatedTemplate?.metadata?.name,
      });
    };

  return (
    <NetworkInterfaceModal
      vm={vm}
      headerText={t('Edit network interface')}
      onSubmit={onSubmit}
      nicPresentation={nicPresentation}
      isOpen={isOpen}
      onClose={onClose}
      namespace={template?.metadata?.namespace}
    />
  );
};

export default TemplatesEditNetworkInterfaceModal;
