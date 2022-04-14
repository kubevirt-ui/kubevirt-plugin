import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { usePods } from '@kubevirt-utils/hooks/usePods';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type PodsProps = {
  vmi: V1VirtualMachineInstance;
};

const Pods: React.FC<PodsProps> = ({ vmi }) => {
  const [pods] = usePods(vmi?.metadata?.namespace);
  const vmiPod = getVMIPod(vmi, pods);
  return vmiPod ? (
    <ResourceLink
      key={vmiPod?.metadata?.uid}
      kind={vmiPod?.kind}
      name={vmiPod?.metadata?.name}
      namespace={vmiPod?.metadata?.namespace}
    />
  ) : (
    <>-</>
  );
};

export default Pods;
