import * as React from 'react';

import { usePods } from '@kubevirt-utils/hooks/usePods';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type PodsProps = {
  namespace: string;
};

const Pods: React.FC<PodsProps> = ({ namespace }) => {
  const [pods] = usePods(namespace);

  return (
    <>
      {pods?.map((pod) => (
        <ResourceLink
          key={pod?.metadata?.uid}
          kind={pod.kind}
          name={pod?.metadata?.name}
          namespace={pod?.metadata?.namespace}
        />
      ))}
    </>
  );
};

export default Pods;
