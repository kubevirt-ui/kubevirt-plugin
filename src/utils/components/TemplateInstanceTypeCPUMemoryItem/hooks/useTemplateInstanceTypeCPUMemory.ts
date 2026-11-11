import { useMemo } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypeCPUMemoryDisplayText } from '@kubevirt-utils/resources/instancetype/selectors';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import {
  findInstanceTypeForTemplate,
  getTemplateVirtualMachineObject,
  type Template,
} from '@kubevirt-utils/resources/template';
import { getCluster } from '@multicluster/helpers/selectors';

type UseTemplateInstanceTypeCPUMemoryReturn = {
  allInstanceTypes: InstanceTypeUnion[];
  cpuMemoryText: string | undefined;
  instanceType: InstanceTypeUnion | undefined;
  instanceTypesLoaded: boolean;
  vm: V1VirtualMachine;
};

export const useTemplateInstanceTypeCPUMemory = (
  template: Template,
): UseTemplateInstanceTypeCPUMemoryReturn => {
  const { t } = useKubevirtTranslation();
  const vm = getTemplateVirtualMachineObject(template);

  const { allInstanceTypes, loaded: instanceTypesLoaded } = useInstanceTypesAndPreferences(
    getNamespace(template),
    getCluster(template),
  );

  const instanceType = useMemo(
    () => findInstanceTypeForTemplate(template, allInstanceTypes),
    [allInstanceTypes, template],
  );

  const cpuMemoryText = useMemo(
    () => getInstanceTypeCPUMemoryDisplayText(instanceType, t),
    [instanceType, t],
  );

  return {
    allInstanceTypes,
    cpuMemoryText,
    instanceType,
    instanceTypesLoaded,
    vm,
  };
};
