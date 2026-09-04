import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { getIPAddressesDisplayValue } from '../ips';

const createVMI = (
  interfaces: Array<{ ipAddress?: string; ipAddresses?: string[]; name?: string }>,
): V1VirtualMachineInstance =>
  ({
    status: { interfaces },
  }) as V1VirtualMachineInstance;

describe('getIPAddressesDisplayValue', () => {
  it('returns a dash when the VMI is missing or has no IPs', () => {
    expect(getIPAddressesDisplayValue(undefined)).toBe(NO_DATA_DASH);
    expect(getIPAddressesDisplayValue(createVMI([]))).toBe(NO_DATA_DASH);
  });

  it('returns a single IP', () => {
    expect(
      getIPAddressesDisplayValue(
        createVMI([{ ipAddress: '10.0.0.1', ipAddresses: ['10.0.0.1'], name: 'eth0' }]),
      ),
    ).toBe('10.0.0.1');
  });

  it('joins multiple IPs with a comma', () => {
    expect(
      getIPAddressesDisplayValue(
        createVMI([{ ipAddress: '10.0.0.1', ipAddresses: ['10.0.0.1', '10.0.0.2'], name: 'eth0' }]),
      ),
    ).toBe('10.0.0.1, 10.0.0.2');
  });

  it('keeps global IPv6 and strips link-local addresses', () => {
    expect(
      getIPAddressesDisplayValue(
        createVMI([
          {
            ipAddress: '10.0.0.1',
            ipAddresses: ['10.0.0.1', '2001:db8::1', 'fe80::1'],
            name: 'eth0',
          },
        ]),
      ),
    ).toBe('10.0.0.1, 2001:db8::1');
  });

  it('returns a dash for unnamed interfaces', () => {
    expect(
      getIPAddressesDisplayValue(createVMI([{ ipAddress: '10.0.0.1', ipAddresses: ['10.0.0.1'] }])),
    ).toBe(NO_DATA_DASH);
  });
});
