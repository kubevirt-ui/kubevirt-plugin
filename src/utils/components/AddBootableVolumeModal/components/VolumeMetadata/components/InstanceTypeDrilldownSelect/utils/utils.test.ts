import { type V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { KUBEVIRT_IO } from './constants';
import { getInstanceTypeMenuItems } from './utils';

const redHatInstanceType = (name: string): V1beta1VirtualMachineClusterInstancetype =>
  ({
    metadata: {
      labels: { 'instancetype.kubevirt.io/vendor': KUBEVIRT_IO },
      name,
    },
    spec: {
      cpu: { guest: 1 },
      memory: { guest: '2Gi' },
    },
  }) as V1beta1VirtualMachineClusterInstancetype;

describe('getInstanceTypeMenuItems', () => {
  it('should include only series from the current instance type list', () => {
    const withU1 = getInstanceTypeMenuItems([redHatInstanceType('u1.medium')]);
    const withoutU1 = getInstanceTypeMenuItems([redHatInstanceType('cx1.medium')]);

    expect(withU1.redHatProvided.items.map((item) => item.seriesName)).toEqual(['u1']);
    expect(withoutU1.redHatProvided.items.map((item) => item.seriesName)).toEqual(['cx1']);
  });
});
