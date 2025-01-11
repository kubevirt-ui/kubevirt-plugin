import { VirtualMachineData } from '../../types/vm';

import { CUST_VM_IT_NAME, QUICK_VM_IT_NAME, TEST_NS } from './index';

export const VM_IT_QUICK: VirtualMachineData = {
  name: QUICK_VM_IT_NAME,
  namespace: TEST_NS,
  volume: 'fedora',
};

export const VM_IT_CUST: VirtualMachineData = {
  bootMode: 'UEFI',
  description: 'Customized VM from Instancetype',
  hostname: 'vm-it-host',
  iType: 'small',
  name: CUST_VM_IT_NAME,
  namespace: TEST_NS,
  newSecret: 'test-secret',
  password: 'set-own-pwd',
  username: 'cnv-test',
  volume: 'rhel9',
};

export const VM_TMPL_QUICK: VirtualMachineData = {
  name: QUICK_VM_IT_NAME,
  namespace: TEST_NS,
  volume: 'fedora',
};

export const VM_TMPL_CUST: VirtualMachineData = {
  bootMode: 'UEFI',
  description: 'Customized VM from Instancetype',
  hostname: 'vm-it-host',
  iType: 'small',
  name: CUST_VM_IT_NAME,
  namespace: TEST_NS,
  newSecret: 'test-secret',
  password: 'set-own-pwd',
  username: 'cnv-test',
  volume: 'rhel9',
};
