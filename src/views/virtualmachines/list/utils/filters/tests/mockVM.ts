import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export const createMockVM = (overrides: Partial<V1VirtualMachine> = {}): V1VirtualMachine => ({
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: {
    name: 'test-vm',
    namespace: 'default',
    ...overrides.metadata,
  },
  spec: {
    template: {
      metadata: {},
      spec: {
        domain: {
          devices: {},
        },
      },
    },
    ...overrides.spec,
  },
  status: {
    printableStatus: 'Running',
    ...overrides.status,
  },
});
