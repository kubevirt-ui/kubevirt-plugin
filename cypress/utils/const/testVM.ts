import { VirtualMachineData } from '../../types/vm';

import { DiskSource } from './diskSource';
import { TEST_NS } from './index';
import { TEMPLATE } from './template';

export const defaultSourceVM: VirtualMachineData = {
  name: 'vm-from-default-source',
  namespace: TEST_NS,
  template: TEMPLATE.FEDORA,
  diskSource: DiskSource.REGISTRY,
};
