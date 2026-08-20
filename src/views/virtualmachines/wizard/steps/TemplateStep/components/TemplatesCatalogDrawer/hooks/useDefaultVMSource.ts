import { useCallback, useState } from 'react';

import {
  type V1beta1DataVolumeSpec,
  type V1ContainerDiskSource,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';
import { getDiskSource } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';

type DefaultVMSourceResult = {
  currentDiskSource: undefined | V1beta1DataVolumeSpec | V1ContainerDiskSource;
  isDefaultDiskSource: boolean;
  updateDefaultDiskSource: (generatedVM: V1VirtualMachine) => void;
};

const useDefaultVMSource = (virtualMachine: V1VirtualMachine): DefaultVMSourceResult => {
  const [defaultDiskSource, setDefaultDiskSource] = useState<
    V1beta1DataVolumeSpec | V1ContainerDiskSource
  >();

  const currentDiskSource = getDiskSource(virtualMachine, ROOTDISK);

  const updateDefaultDiskSource = useCallback((generatedVM: V1VirtualMachine): void => {
    const source = getDiskSource(generatedVM, ROOTDISK);
    setDefaultDiskSource(source);
  }, []);

  const { storage: _defaultStorage, ...restDefaultSpec }: V1beta1DataVolumeSpec = {
    ...(defaultDiskSource as V1beta1DataVolumeSpec),
  };
  const { storage: _currentStorage, ...restCurrentSpec }: V1beta1DataVolumeSpec = {
    ...(currentDiskSource as V1beta1DataVolumeSpec),
  };
  const isDefaultDiskSource =
    defaultDiskSource !== undefined && isEqualObject(restDefaultSpec, restCurrentSpec);

  return {
    currentDiskSource,
    isDefaultDiskSource,
    updateDefaultDiskSource,
  };
};

export default useDefaultVMSource;
