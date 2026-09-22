import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { getK8sRowId } from './utils';

type ClusteredResource = K8sResourceCommon & { cluster?: string };

describe('getK8sRowId', () => {
  it('should identify a resource without uid by cluster, namespace, and name', () => {
    const resource: ClusteredResource = {
      cluster: 'east',
      metadata: { name: 'vm-1', namespace: 'ns-1' },
    };

    expect(getK8sRowId(resource)).toBe('east/ns-1/vm-1');
  });
});
