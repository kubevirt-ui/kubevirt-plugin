import React, { FC } from 'react';

import { modelToGroupVersionKind, PodModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import '../../../TopologyVMDetailsPanel.scss';

type VMPodDetailsItemProps = {
  pods?: IoK8sApiCoreV1Pod[];
  vmi: V1VirtualMachineInstance;
};

const VMPodDetailsItem: FC<VMPodDetailsItemProps> = ({ pods, vmi }) => {
  const { t } = useKubevirtTranslation();

  const launcherPod = getVMIPod(vmi, pods);
  const launcherPodName = getName(launcherPod);

  return (
    <VirtualMachineDescriptionItem
      descriptionData={
        launcherPodName ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(PodModel)}
            name={launcherPodName}
            namespace={getNamespace(launcherPod)}
          />
        ) : (
          NO_DATA_DASH
        )
      }
      className="topology-vm-details-panel__item"
      descriptionHeader={t('Pod')}
    />
  );
};

export default VMPodDetailsItem;
