import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ensurePath, isIPV6LinkLocal } from '@kubevirt-utils/utils/utils';

describe('Test ensurePath', () => {
  describe('Only one path', () => {
    it('Non existing path', () => {
      const data: V1VirtualMachine = {
        metadata: {
          name: 'test-virtual-machine',
        },
        spec: {
          template: {},
        },
      };

      ensurePath(data, 'spec.template.spec.domain.devices');

      expect(data.spec.template.spec.domain.devices).toBeDefined();
    });

    it('Existing path', () => {
      const data: V1VirtualMachine = {
        metadata: {
          name: 'test-virtual-machine',
        },
        spec: {
          template: {},
        },
      };

      ensurePath(data, 'spec.template');

      expect(data.spec.template).toBeDefined();
    });
  });

  describe('Multiple paths', () => {
    it('Non existing paths', () => {
      const data: V1VirtualMachine = {
        metadata: {
          name: 'test-virtual-machine',
        },
        spec: {
          template: {},
        },
      };

      ensurePath(data, ['spec.template.spec.domain.devices']);

      expect(data.spec.template.spec.domain.devices).toBeDefined();
    });

    it('Non existing and existing paths', () => {
      const data: V1VirtualMachine = {
        metadata: {
          name: 'test-virtual-machine',
        },
        spec: {
          template: {},
        },
      };

      ensurePath(data, ['spec.template']);

      expect(data.spec.template).toBeDefined();
    });
  });
});

describe('Test isIPV6LinkLocal', () => {
  test('IPv6 link-local address', () => {
    expect(isIPV6LinkLocal('fe80::1')).toBe(true);
    expect(isIPV6LinkLocal('fe81::1')).toBe(true);
    expect(isIPV6LinkLocal('fea0::1')).toBe(true);
  });

  test('regular IPv4 and IPv6 addresses', () => {
    expect(isIPV6LinkLocal('192.168.1.1')).toBe(false);
    expect(isIPV6LinkLocal('2001:db8::1')).toBe(false);
    expect(isIPV6LinkLocal('fec0:db8::1')).toBe(false);
    expect(isIPV6LinkLocal('::1')).toBe(false);
  });

  test('invalid input', () => {
    expect(isIPV6LinkLocal(undefined)).toBe(false);
    expect(isIPV6LinkLocal(null)).toBe(false);
    expect(isIPV6LinkLocal('')).toBe(false);
  });
});
