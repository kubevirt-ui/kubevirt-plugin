import { useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getEffectiveRunStrategy, type RunStrategy } from '@kubevirt-utils/resources/vm';

type PreservedRunStrategy = {
  key: string;
  strategy: RunStrategy | undefined;
};

const usePreservedRunStrategy = (vm: undefined | V1VirtualMachine): RunStrategy | undefined => {
  const vmKey = vm ? `${getNamespace(vm)}/${getName(vm)}` : '';
  const [preserved, setPreserved] = useState<PreservedRunStrategy>({
    key: '',
    strategy: undefined,
  });

  if (!vmKey) {
    return undefined;
  }

  if (preserved.key === vmKey) {
    return preserved.strategy;
  }

  const strategy = getEffectiveRunStrategy(vm);
  setPreserved({ key: vmKey, strategy });

  return strategy;
};

export default usePreservedRunStrategy;
