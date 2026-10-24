import { VirtualMachineData } from '../../types/vm';

import {
  CUST_VM_IT_NAME,
  CUST_VM_TMPL_NAME,
  QUICK_VM_IT_NAME,
  QUICK_VM_TMPL_NAME,
  TEST_NS,
  TEST_SECRET_NAME,
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
  // Prefer centos-stream10: Ready on OCP 4.20+/CNV stable hot clusters
  // (release-4.19 UI is exercised against those clusters; OCP 4.19 is unavailable).
  volume: 'centos-stream10',
};

export const VM_TMPL_QUICK: VirtualMachineData = {
  name: QUICK_VM_TMPL_NAME,
  namespace: TEST_NS,
  // Catalog "Boot source available" still surfaces stream9 (not stream10) on
  // current CNV hot clusters; IT volumes can use stream10 separately.
  template: TEMPLATE.CENTOSSTREAM9,
};

export const VM_TMPL_CUST: VirtualMachineData = {
  bootMode: 'UEFI (secure)',
  cloudInitPwd: 'set-own-pwd',
  cloudInitUname: 'cnv-test',
  description: 'Customized VM from Template',
  existSecret: TEST_SECRET_NAME,
  hostname: 'vm-template-host',
  name: CUST_VM_TMPL_NAME,
  namespace: TEST_NS,
  template: TEMPLATE.FEDORA,
};
