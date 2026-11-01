import { type FC } from 'react';

import { isInstanceTypeVM } from '@kubevirt-utils/resources/instancetype/helper';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

import WizardInstanceTypeCPUMemory from './WizardInstanceTypeCPUMemory';
import WizardNonInstanceTypeCPUMemory from './WizardNonInstanceTypeCPUMemory';

const CPUMemory: FC = () => {
  const { vmDraft: vm } = useWizardVMDraft();

  if (!vm) {
    return null;
  }

  if (isInstanceTypeVM(vm)) {
    return <WizardInstanceTypeCPUMemory vm={vm} />;
  }

  return <WizardNonInstanceTypeCPUMemory vm={vm} />;
};

export default CPUMemory;
