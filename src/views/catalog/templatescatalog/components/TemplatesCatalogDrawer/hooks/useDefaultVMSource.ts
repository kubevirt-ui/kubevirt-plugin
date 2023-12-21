import { useCallback, useRef } from 'react';

import {
  V1beta1DataVolumeSpec,
  V1ContainerDiskSource,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';

import { getDiskSource } from '../StorageSection/utils';

const useDefaultVMSource = (vm: V1VirtualMachine) => {
  const defaultDiskSource = useRef<V1beta1DataVolumeSpec | V1ContainerDiskSource>();

  const currentDiskSource = getDiskSource(vm, ROOTDISK);

  const updateDefaultDiskSource = useCallback((generatedVM: V1VirtualMachine) => {
    const source = getDiskSource(generatedVM, ROOTDISK);

    defaultDiskSource.current = source;
  }, []);

  return {
    currentDiskSource,
    isDefaultDiskSource: currentDiskSource === defaultDiskSource.current,
    updateDefaultDiskSource,
  };
};

export default useDefaultVMSource;
