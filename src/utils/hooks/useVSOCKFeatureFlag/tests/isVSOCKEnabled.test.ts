import { isVSOCKEnabled } from '../../../resources/vm/utils/selectors';

import { createVM, createVMI } from './mocks';

describe('isVSOCKEnabled', () => {
  it('should detect VSOCK on a VM created with autoattachVSOCK=true', () => {
    expect(isVSOCKEnabled(createVM({ autoattachVSOCK: true }))).toBe(true);
  });

  it('should not detect VSOCK on a VM created without the field', () => {
    expect(isVSOCKEnabled(createVM())).toBe(false);
  });

  it('should not detect VSOCK on a VM created with autoattachVSOCK=false', () => {
    expect(isVSOCKEnabled(createVM({ autoattachVSOCK: false }))).toBe(false);
  });

  it('should handle a VM with no devices block', () => {
    const vmWithoutDevices = createVM();
    delete vmWithoutDevices?.spec?.template?.spec?.domain?.devices;
    expect(isVSOCKEnabled(vmWithoutDevices)).toBe(false);
  });

  it('should handle undefined input', () => {
    expect(isVSOCKEnabled(undefined)).toBe(false);
  });

  it('should detect VSOCK on a running VMI with autoattachVSOCK=true', () => {
    expect(isVSOCKEnabled(createVMI({ autoattachVSOCK: true }))).toBe(true);
  });

  it('should not detect VSOCK on a running VMI without the field', () => {
    expect(isVSOCKEnabled(createVMI())).toBe(false);
  });
});
