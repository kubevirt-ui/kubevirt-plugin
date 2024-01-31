import { useCallback, useRef } from 'react';

import {
  V1beta1DataVolumeSpec,
  V1ContainerDiskSource,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';

import { getDiskSource } from '../StorageSection/utils';

const useDefaultVMSource = (vm: V1VirtualMachine) => {
  const defaultDiskSource = useRef<V1beta1DataVolumeSpec | V1ContainerDiskSource>();

  const currentDiskSource = getDiskSource(vm, ROOTDISK);

  const updateDefaultDiskSource = useCallback((generatedVM: V1VirtualMachine) => {
    const source = getDiskSource(generatedVM, ROOTDISK);

    defaultDiskSource.current = source;
  }, []);

  const { storage: _, ...restDefaultSpec }: V1beta1DataVolumeSpec = {
    ...(defaultDiskSource.current as V1beta1DataVolumeSpec),
  };
  const { storage: __, ...restCurrentSpec }: V1beta1DataVolumeSpec = {
    ...(currentDiskSource as V1beta1DataVolumeSpec),
  };

  return {
    currentDiskSource,
    isDefaultDiskSource: isEqualObject(restDefaultSpec, restCurrentSpec),
    updateDefaultDiskSource,
  };
};

export default useDefaultVMSource;
