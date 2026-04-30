import { IoK8sApiCoreV1Pod, IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getServicesForVmi, getVMILabelForServiceSelector } from '../services';

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

  it('Fallback to VMI labels when pod has empty labels', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithMatchingSelectors];
    const pod = createMockPod({});
    const vmi = createMockVMI({ 'vm.kubevirt.io/name': 'fedora-proposed-rodent' });
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, pod, vm, vmi);

    expect(result).toEqual([serviceWithMatchingSelectors]);
  });

  it('Fallback to VM template labels when pod and VMI are not available', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithMatchingSelectors];
    const vm: V1VirtualMachine = {
      ...createMockVM('fedora-proposed-rodent'),
      spec: {
        template: {
          metadata: {
            labels: { 'vm.kubevirt.io/name': 'fedora-proposed-rodent' },
          },
          spec: { domain: { devices: {} } },
        },
      },
    };

    const result = getServicesForVmi(services, undefined, vm);

    expect(result).toEqual([serviceWithMatchingSelectors]);
  });

  it('Multi-key selectors require all keys to match', () => {
    const services: IoK8sApiCoreV1Service[] = [
      {
        ...serviceWithMatchingSelectors,
        spec: {
          ...serviceWithMatchingSelectors.spec,
          selector: {
            'extra-label': 'extra-value',
            'vm.kubevirt.io/name': 'fedora-proposed-rodent',
          },
        },
      },
    ];
    const pod = createMockPod({
      'extra-label': 'extra-value',
      'vm.kubevirt.io/name': 'fedora-proposed-rodent',
    });
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, pod, vm);

    expect(result).toEqual([services[0]]);
  });

  it('Multi-key selectors fail when not all keys match', () => {
    const services: IoK8sApiCoreV1Service[] = [
      {
        ...serviceWithMatchingSelectors,
        spec: {
          ...serviceWithMatchingSelectors.spec,
          selector: {
            'extra-label': 'different-value',
            'vm.kubevirt.io/name': 'fedora-proposed-rodent',
          },
        },
      },
    ];
    const pod = createMockPod({
      'extra-label': 'extra-value',
      'vm.kubevirt.io/name': 'fedora-proposed-rodent',
    });
    const vm = createMockVM('fedora-proposed-rodent');

    const result = getServicesForVmi(services, pod, vm);

    expect(result).toEqual([]);
  });

  it('VM name fallback for vm.kubevirt.io/name selector when pod label differs', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithMatchingSelectors];
    const vmi = createMockVMI({});
    (vmi.metadata as { name: string }).name = 'fedora-proposed-rodent';

    const result = getServicesForVmi(services, undefined, undefined, vmi);

    expect(result).toEqual([serviceWithMatchingSelectors]);
  });

  it('Returns empty when no resources provided', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithMatchingSelectors];

    const result = getServicesForVmi(services);

    expect(result).toEqual([]);
  });
});

describe('Test getVMILabelForServiceSelector', () => {
  it('Prefers vmi.kubevirt.io/id from pod labels', () => {
    const pod = createMockPod({
      'vm.kubevirt.io/name': 'my-vm',
      'vmi.kubevirt.io/id': 'my-vm-hash-123',
    });
    const vm = createMockVM('my-vm');

    const result = getVMILabelForServiceSelector(pod, vm);

    expect(result).toEqual({
      labelKey: 'vmi.kubevirt.io/id',
      labelValue: 'my-vm-hash-123',
    });
  });

  it('Falls back to vm.kubevirt.io/name from pod labels', () => {
    const pod = createMockPod({ 'vm.kubevirt.io/name': 'my-vm' });
    const vm = createMockVM('my-vm');

    const result = getVMILabelForServiceSelector(pod, vm);

    expect(result).toEqual({
      labelKey: 'vm.kubevirt.io/name',
      labelValue: 'my-vm',
    });
  });

  it('Falls back to VM name when pod has no relevant labels', () => {
    const pod = createMockPod({ 'some-other-label': 'value' });
    const vm = createMockVM('my-vm');

    const result = getVMILabelForServiceSelector(pod, vm);

    expect(result).toEqual({
      labelKey: 'vm.kubevirt.io/name',
      labelValue: 'my-vm',
    });
  });

  it('Falls back to VM name when pod has empty labels', () => {
    const pod = createMockPod({});
    const vm = createMockVM('my-vm');

    const result = getVMILabelForServiceSelector(pod, vm);

    expect(result).toEqual({
      labelKey: 'vm.kubevirt.io/name',
      labelValue: 'my-vm',
    });
  });
});
