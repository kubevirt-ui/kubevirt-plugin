import React, { FC } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMINodeName } from '@kubevirt-utils/resources/vmi';
import { K8sVerb, ResourceLink, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { getNodeName } from '@topology/utils/selectors/selectors';

import '../../../TopologyVMDetailsPanel.scss';

type VMNodeDetailsItemProps = {
  launcherPod: IoK8sApiCoreV1Pod;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VMNodeDetailsItem: FC<VMNodeDetailsItemProps> = ({ launcherPod, vm, vmi }) => {
  const { t } = useKubevirtTranslation();

  const [canGetNode] = useAccessReview({
    namespace: getNamespace(vm),
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  if (!canGetNode) return null;

  const nodeName = getVMINodeName(vmi) || getNodeName(launcherPod);

  return (
    <VirtualMachineDescriptionItem
      descriptionData={
        nodeName ? (
          <ResourceLink groupVersionKind={modelToGroupVersionKind(NodeModel)} name={nodeName} />
        ) : (
          NO_DATA_DASH
        )
      }
      className="topology-vm-details-panel__item"
      descriptionHeader={t('Node')}
    />
  );
};

export default VMNodeDetailsItem;
