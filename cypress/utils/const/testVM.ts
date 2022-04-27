import { VirtualMachineData } from '../../types/vm';

import { DiskSource } from './diskSource';
import { TEST_NS } from './index';
import { TEMPLATE } from './template';

export const defaultSourceVM: VirtualMachineData = {
  name: 'vm-from-default',
  namespace: TEST_NS,
  template: TEMPLATE.FEDORA,
  diskSource: DiskSource.DEFAULT,
};

export const urlSourceVM: VirtualMachineData = {
  name: 'vm-from-url',
  namespace: TEST_NS,
  template: TEMPLATE.FEDORA,
  diskSource: DiskSource.URL,
  startOnCreation: true,
};
