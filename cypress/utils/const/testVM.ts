import { VirtualMachineData } from '../../types/vm';

import { DiskSource } from './diskSource';
import { TEST_NS } from './index';
import { TEMPLATE } from './template';

export const VM_IT_QUICK: VirtualMachineData = {
  name: 'vm-it-quick',
  namespace: TEST_NS,
  volume: 'fedora',
};

export const VM_IT_CUST: VirtualMachineData = {
  bootMode: 'UEFI',
  description: 'Customized VM from Instancetype',
  hostname: 'vm-it-host',
  name: 'vm-it-custom',
  namespace: TEST_NS,
  newSecret: 'test-it-secret',
  password: 'set-own-pwd',
  username: 'cnv-test',
  volume: 'centos-stream10',
};

export const VM_TMPL_QUICK: VirtualMachineData = {
  name: 'vm-template-quick',
  namespace: TEST_NS,
  template: TEMPLATE.CENTOSSTREAM9,
};

export const VM_TMPL_CUST: VirtualMachineData = {
  bootMode: 'UEFI (secure)',
  description: 'Customized VM from Template',
  existSecret: 'auto-test-secret',
  hostname: 'vm-template-host',
  name: 'vm-template-custom',
  namespace: TEST_NS,
  password: 'set-own-pwd',
  template: TEMPLATE.FEDORA,
  username: 'cnv-test',
};

export const VM_PVC: VirtualMachineData = {
  diskSource: DiskSource.PVC,
  name: 'vm-from-pvc',
  namespace: TEST_NS,
  template: TEMPLATE.CENTOSSTREAM9,
};

export const VM_UPLOAD: VirtualMachineData = {
  diskSource: DiskSource.Upload,
  name: 'vm-from-upload',
  namespace: TEST_NS,
  template: TEMPLATE.RHEL9,
};
