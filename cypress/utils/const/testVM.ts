import { VirtualMachineData } from '../../types/vm';

import {
  CUST_VM_IT_NAME,
  CUST_VM_TMPL_NAME,
  QUICK_VM_IT_NAME,
  QUICK_VM_TMPL_NAME,
  TEST_NS,
} from './index';
import { TEMPLATE } from './template';

export const VM_IT_QUICK: VirtualMachineData = {
  name: QUICK_VM_IT_NAME,
  namespace: TEST_NS,
  volume: 'fedora',
};

export const VM_IT_CUST: VirtualMachineData = {
  bootMode: 'UEFI',
  cloudInitPwd: 'set-own-pwd',
  cloudInitUname: 'cnv-test',
  description: 'Customized VM from Instancetype',
  hostname: 'vm-it-host',
  name: CUST_VM_IT_NAME,
  namespace: TEST_NS,
  newSecret: 'test-it-secret',
  volume: 'centos-stream10',
};

export const VM_TMPL_QUICK: VirtualMachineData = {
  name: QUICK_VM_TMPL_NAME,
  namespace: TEST_NS,
  template: TEMPLATE.CENTOSSTREAM9,
};

export const VM_TMPL_CUST: VirtualMachineData = {
  bootMode: 'UEFI (secure)',
  cloudInitPwd: 'set-own-pwd',
  cloudInitUname: 'cnv-test',
  cpu: '2',
  description: 'Customized VM from Template',
  existSecret: 'auto-test-secret',
  hostname: 'vm-template-host',
  name: CUST_VM_TMPL_NAME,
  namespace: TEST_NS,
  template: TEMPLATE.FEDORA,
};
