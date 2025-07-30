import { VirtualMachineData } from '../../types/vm';

import { DiskSource } from './diskSource';
import {
  CUST_VM_IT_NAME,
  CUST_VM_TMPL_NAME,
  DEFAULT_VM_NAME,
  QUICK_VM_IT_NAME,
  QUICK_VM_TMPL_NAME,
  TEST_IT_NAME,
  TEST_NS,
  TEST_VM_NAME,
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
  description: 'Customized VM from Template',
  existSecret: 'auto-test-secret',
  hostname: 'vm-template-host',
  name: CUST_VM_TMPL_NAME,
  namespace: TEST_NS,
  template: TEMPLATE.FEDORA,
};

export const VM_W2K19: VirtualMachineData = {
  diskSource: DiskSource.URL_WIN2K19,
  mountWinDriver: false,
  name: 'win19-vm-from-url',
  namespace: TEST_NS,
  template: TEMPLATE.WIN2K19,
};

export const VM_ISO: VirtualMachineData = {
  diskSource: DiskSource.ISO,
  mountWinDriver: true,
  name: 'win11-vm-from-iso',
  namespace: TEST_NS,
  startOnCreation: false,
  template: TEMPLATE.WIN11,
};

export const VM_EXAMPLE: VirtualMachineData = {
  name: DEFAULT_VM_NAME,
  namespace: TEST_NS,
  template: TEMPLATE.YAML,
  userTemplate: true,
};

export const TEST_VM: VirtualMachineData = {
  hostname: 'test-hostname',
  name: TEST_VM_NAME,
  namespace: TEST_NS,
  template: TEMPLATE.RHEL9,
};

export const TEST_IT_VM: VirtualMachineData = {
  name: TEST_IT_NAME,
  namespace: TEST_NS,
  volume: 'fedora',
};
