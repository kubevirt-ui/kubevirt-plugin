import { useCallback, useState } from 'react';

import {
  type V1beta1DataVolumeSpec,
  type V1ContainerDiskSource,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';
import { getDiskSource } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';

type DiskSource = V1beta1DataVolumeSpec | V1ContainerDiskSource;

type UseDefaultVMSourceResult = {
  currentDiskSource: DiskSource | undefined;
  isDefaultDiskSource: boolean;
  updateDefaultDiskSource: (generatedVM: V1VirtualMachine) => void;
};

const useDefaultVMSource = (vm: V1VirtualMachine): UseDefaultVMSourceResult => {
  const [defaultDiskSourceState, setDefaultDiskSourceState] = useState<DiskSource>();

  const currentDiskSource = getDiskSource(vm, ROOTDISK);

  const updateDefaultDiskSource = useCallback((generatedVM: V1VirtualMachine) => {
    const source = getDiskSource(generatedVM, ROOTDISK);
    setDefaultDiskSourceState(source);
  }, []);

  const { storage: _defaultStorage, ...restDefaultSpec }: V1beta1DataVolumeSpec = {
    ...(defaultDiskSourceState as V1beta1DataVolumeSpec),
  };
  const { storage: _currentStorage, ...restCurrentSpec }: V1beta1DataVolumeSpec = {
    ...(currentDiskSource as V1beta1DataVolumeSpec),
  };
  const isDefaultDiskSource =
    defaultDiskSourceState !== undefined && isEqualObject(restDefaultSpec, restCurrentSpec);

  return {
    currentDiskSource,
    isDefaultDiskSource,
    updateDefaultDiskSource,
  };
};

export default useDefaultVMSource;
