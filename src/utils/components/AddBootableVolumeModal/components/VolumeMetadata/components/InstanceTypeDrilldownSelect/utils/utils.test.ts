import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { initialMenuItems, REDHAT_COM } from './constants';
import { getInstanceTypeMenuItems } from './utils';

const redHatInstanceType = (
  name: string,
  memory = '2Gi',
): V1beta1VirtualMachineClusterInstancetype =>
  ({
    metadata: {
      labels: { 'instancetype.kubevirt.io/vendor': REDHAT_COM },
      name,
    },
    spec: {
      cpu: { guest: 1 },
      memory: { guest: memory },
    },
  } as V1beta1VirtualMachineClusterInstancetype);

const userInstanceType = (name: string): V1beta1VirtualMachineClusterInstancetype =>
  ({
    metadata: { name },
    spec: { cpu: { guest: 1 }, memory: { guest: '1Gi' } },
  } as V1beta1VirtualMachineClusterInstancetype);

describe('getInstanceTypeMenuItems', () => {
  it('should include only series from the current instance type list', () => {
    const withU1 = getInstanceTypeMenuItems([redHatInstanceType('u1.medium')]);
    const withoutU1 = getInstanceTypeMenuItems([redHatInstanceType('cx1.medium')]);

    expect(withU1.redHatProvided.items.map((item) => item.seriesName)).toEqual(['u1']);
    expect(withoutU1.redHatProvided.items.map((item) => item.seriesName)).toEqual(['cx1']);
  });

  it('should not mutate the shared initial menu items between calls', () => {
    getInstanceTypeMenuItems([redHatInstanceType('u1.medium'), userInstanceType('my-it')]);

    expect(initialMenuItems.redHatProvided.items).toEqual([]);
    expect(initialMenuItems.userProvided.items).toEqual([]);
  });

  it('should return a fresh copy of the menu items when the list is empty', () => {
    const first = getInstanceTypeMenuItems([]);
    const second = getInstanceTypeMenuItems([]);

    expect(first).not.toBe(initialMenuItems);
    expect(first.redHatProvided.items).toEqual([]);
    expect(first.redHatProvided.items).not.toBe(second.redHatProvided.items);
    expect(first.userProvided.items).not.toBe(second.userProvided.items);
  });

  it('should not leak user provided instance types into later calls', () => {
    getInstanceTypeMenuItems([userInstanceType('my-it')]);
    const next = getInstanceTypeMenuItems([redHatInstanceType('u1.medium')]);

    expect(next.userProvided.items).toEqual([]);
  });

  it('should sort sizes by memory', () => {
    const { redHatProvided } = getInstanceTypeMenuItems([
      redHatInstanceType('u1.large', '8Gi'),
      redHatInstanceType('u1.small', '2Gi'),
      redHatInstanceType('u1.medium', '4Gi'),
    ]);

    expect(redHatProvided.items[0].sizes.map((size) => size.sizeLabel)).toEqual([
      'small',
      'medium',
      'large',
    ]);
  });
});
