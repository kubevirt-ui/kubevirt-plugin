import { IoK8sApiCoreV1Pod, IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { getServicesForVmi } from '../services';

import {
  serviceWithMatchingSelectors,
  serviceWithoutMatchingSelectors,
  serviceWithoutSelectors,
  serviceWithUndefinedSelectors,
} from './mocks';

const createMockPod = (labels: { [key: string]: string }): IoK8sApiCoreV1Pod => ({
  apiVersion: 'v1',
  kind: 'Pod',
  metadata: {
    labels,
    name: 'test-pod',
    namespace: 'default',
  },
  spec: {
    containers: [],
  },
  status: {},
});

const createMockVM = (name: string): V1VirtualMachine => ({
  apiVersion: 'v1',
  kind: 'VirtualMachine',
  metadata: {
    name,
    namespace: 'default',
  },
  spec: {
    template: {
      spec: {
        domain: {
          devices: {},
        },
      },
    },
  },
});

const createMockVMI = (labels: { [key: string]: string }): V1VirtualMachineInstance => ({
  apiVersion: 'v1',
  kind: 'VirtualMachineInstance',
  metadata: {
    labels,
    name: 'test-vmi',
    namespace: 'default',
  },
  spec: {
    domain: {
      devices: {},
    },
  },
  status: {},
});

describe('Test getServicesForVmi', () => {
  it('No services', () => {
    const services: IoK8sApiCoreV1Service[] = [];
    const pod = createMockPod({ 'vm.kubevirt.io/name': 'fedora-proposed-rodent' });
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, pod, vm);

    expect(result).toEqual([]);
  });

  it('Services with undefined selectors', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithUndefinedSelectors];
    const pod = createMockPod({ 'vm.kubevirt.io/name': 'fedora-proposed-rodent' });
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, pod, vm);

    expect(result).toEqual([]);
  });

  it('Services without selectors', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithoutSelectors];
    const pod = createMockPod({ 'vm.kubevirt.io/name': 'fedora-proposed-rodent' });
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, pod, vm);

    expect(result).toEqual([]);
  });

  it('No services with matching selectors', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithoutMatchingSelectors];
    const pod = createMockPod({ 'vm.kubevirt.io/name': 'fedora-proposed-rodent' });
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, pod, vm);

    expect(result).toEqual([]);
  });

  it('Services with matching selectors', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithMatchingSelectors];
    const pod = createMockPod({ 'vm.kubevirt.io/name': 'fedora-proposed-rodent' });
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, pod, vm);

    expect(result).toEqual([serviceWithMatchingSelectors]);
  });

  it('Services with vmi.kubevirt.io/id selector', () => {
    const services: IoK8sApiCoreV1Service[] = [
      {
        ...serviceWithMatchingSelectors,
        spec: {
          ...serviceWithMatchingSelectors.spec,
          selector: {
            'vmi.kubevirt.io/id': 'fedora-proposed-rodent-hash',
          },
        },
      },
    ];
    const pod = createMockPod({
      'vm.kubevirt.io/name': 'fedora-proposed-rodent',
      'vmi.kubevirt.io/id': 'fedora-proposed-rodent-hash',
    });
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, pod, vm);

    expect(result).toEqual([services[0]]);
  });

  it('Services with vmi.kubevirt.io/id selector using VM name (backward compatibility)', () => {
    const services: IoK8sApiCoreV1Service[] = [
      {
        ...serviceWithMatchingSelectors,
        spec: {
          ...serviceWithMatchingSelectors.spec,
          selector: {
            'vmi.kubevirt.io/id': 'fedora-proposed-rodent',
          },
        },
      },
    ];
    const pod = createMockPod({
      'vm.kubevirt.io/name': 'fedora-proposed-rodent',
      'vmi.kubevirt.io/id': 'fedora-proposed-rodent-hash',
    });
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, pod, vm);

    expect(result).toEqual([services[0]]);
  });

  it('Fallback to VMI labels when pod is not provided', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithMatchingSelectors];
    const vmi = createMockVMI({ 'vm.kubevirt.io/name': 'fedora-proposed-rodent' });
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, undefined, vm, vmi);

    expect(result).toEqual([serviceWithMatchingSelectors]);
  });

  it('Fallback to VM name when pod and VMI are not provided', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithMatchingSelectors];
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, undefined, vm);

    expect(result).toEqual([serviceWithMatchingSelectors]);
  });
});
