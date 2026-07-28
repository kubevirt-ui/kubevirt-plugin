import { parseVMMultusIntoNAD } from './utils';

describe('parseVMMultusIntoNAD', () => {
  const VM_NAMESPACE = 'vm-namespace';

  describe('when networkName has namespace/name format', () => {
    it('should parse namespace and name from the value', () => {
      expect(parseVMMultusIntoNAD('other-ns/my-nad', VM_NAMESPACE)).toEqual({
        name: 'my-nad',
        namespace: 'other-ns',
      });
    });

    it('should handle same namespace as VM', () => {
      expect(parseVMMultusIntoNAD('vm-namespace/my-nad', VM_NAMESPACE)).toEqual({
        name: 'my-nad',
        namespace: 'vm-namespace',
      });
    });
  });

  describe('when networkName has no slash (bare name)', () => {
    it('should use the VM namespace as fallback', () => {
      expect(parseVMMultusIntoNAD('my-nad', VM_NAMESPACE)).toEqual({
        name: 'my-nad',
        namespace: VM_NAMESPACE,
      });
    });

    it('should handle single-word names', () => {
      expect(parseVMMultusIntoNAD('default', VM_NAMESPACE)).toEqual({
        name: 'default',
        namespace: VM_NAMESPACE,
      });
    });
  });

  describe('edge cases', () => {
    it('should return empty namespace for leading slash', () => {
      expect(parseVMMultusIntoNAD('/my-nad', VM_NAMESPACE)).toEqual({
        name: 'my-nad',
        namespace: '',
      });
    });

    it('should return empty name for trailing slash', () => {
      expect(parseVMMultusIntoNAD('ns/', VM_NAMESPACE)).toEqual({
        name: '',
        namespace: 'ns',
      });
    });

    it('should use first slash as separator when multiple exist', () => {
      expect(parseVMMultusIntoNAD('ns/name/extra', VM_NAMESPACE)).toEqual({
        name: 'name/extra',
        namespace: 'ns',
      });
    });

    it('should handle empty vmNamespace fallback', () => {
      expect(parseVMMultusIntoNAD('my-nad', '')).toEqual({
        name: 'my-nad',
        namespace: '',
      });
    });
  });
});
