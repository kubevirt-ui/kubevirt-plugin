import React, { type FC } from 'react';

import NetworkInterfaceModal from '@kubevirt-utils/components/NetworkInterfaceModal/NetworkInterfaceModal';
import { type NetworkInterfaceModalProps } from '@kubevirt-utils/components/NetworkInterfaceModal/types';
import {
  createInterface,
  createNetwork,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getTemplateModel,
  getTemplateVirtualMachineObject,
  type Template,
} from '@kubevirt-utils/resources/template';
import { type NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

import { produceTemplateNetwork } from '../../utils';

type TemplatesEditNetworkInterfaceModalProps = {
  isOpen: boolean;
  nicPresentation: NetworkPresentation;
  onClose: () => void;
  template: Template;
};

const buildUpdatedTemplate = (
  template: Template,
  nicPresentation: NetworkPresentation,
  resultInterface: ReturnType<typeof createInterface>,
  resultNetwork: ReturnType<typeof createNetwork>,
): ReturnType<typeof produceTemplateNetwork> =>
  produceTemplateNetwork(template, (draftVM) => {
    draftVM.spec.template.spec.domain.devices.interfaces = [
      ...draftVM.spec.template.spec.domain.devices.interfaces.filter(
        ({ name }) => name !== nicPresentation?.network?.name,
      ),
      resultInterface,
    ];

    draftVM.spec.template.spec.networks = [
      ...draftVM.spec.template.spec.networks.filter(
        ({ name }) => name !== nicPresentation?.network?.name,
      ),
      resultNetwork,
    ];
  });

const TemplatesEditNetworkInterfaceModal: FC<TemplatesEditNetworkInterfaceModalProps> = ({
  isOpen,
  nicPresentation,
  onClose,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const vm = getTemplateVirtualMachineObject(template);

  const onSubmit: NetworkInterfaceModalProps['onSubmit'] =
    ({
      interfaceLinkState,
      interfaceMACAddress,
      interfaceModel,
      interfaceType,
      isLegacyPasst,
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
        isLegacyPasst,
        nicName,
      });

      const updatedTemplate = buildUpdatedTemplate(
        template,
        nicPresentation,
        resultInterface,
        resultNetwork,
      );

      return kubevirtK8sUpdate({
        cluster: getCluster(template),
        data: updatedTemplate,
        model: getTemplateModel(template),
        name: getName(updatedTemplate),
        ns: getNamespace(updatedTemplate),
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
