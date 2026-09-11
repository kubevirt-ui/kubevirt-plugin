import type { FC } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import type {
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMINodeName } from '@kubevirt-utils/resources/vmi';
import type { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { ResourceLink, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
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
    <DescriptionItem
      className="topology-vm-details-panel__item"
      descriptionData={
        nodeName ? (
          <ResourceLink groupVersionKind={modelToGroupVersionKind(NodeModel)} name={nodeName} />
        ) : (
          NO_DATA_DASH
        )
      }
      descriptionHeader={t('Node')}
    />
  );
};

export default VMNodeDetailsItem;
