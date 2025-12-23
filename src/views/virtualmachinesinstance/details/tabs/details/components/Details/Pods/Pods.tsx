import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { usePods } from '@kubevirt-utils/hooks/usePods';
import { modelToGroupVersionKind, PodModel } from '@kubevirt-utils/models';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';

type PodsProps = {
  vmi: V1VirtualMachineInstance;
};

const Pods: React.FC<PodsProps> = ({ vmi }) => {
  const [pods] = usePods(getNamespace(vmi), getCluster(vmi));
  const vmiPod = getVMIPod(vmi, pods);
  return vmiPod ? (
    <MulticlusterResourceLink
      cluster={getCluster(vmi)}
      groupVersionKind={modelToGroupVersionKind(PodModel)}
      key={getUID(vmiPod)}
      name={getName(vmiPod)}
      namespace={getNamespace(vmiPod)}
    />
  ) : (
    <>-</>
  );
};

export default Pods;
