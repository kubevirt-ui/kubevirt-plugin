import React, { FC } from 'react';

import { V1InstancetypeMatcher, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { vCPUCount } from '@kubevirt-utils/resources/template/utils';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import useInstanceType from '@kubevirt-utils/resources/vm/hooks/useInstanceType';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Skeleton } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

type CPUMemoryProps = {
  fetchVMI?: boolean;
  vm: V1VirtualMachine;
};

const CPUMemory: FC<CPUMemoryProps> = ({ fetchVMI = true, vm }) => {
  const { t } = useKubevirtTranslation();
  const itMatcher: V1InstancetypeMatcher = vm?.spec?.instancetype;
  const { instanceType, instanceTypeLoaded, instanceTypeLoadError } = useInstanceType(itMatcher);
  const isVMRunning = isRunning(vm);
  const { vmi, vmiLoadError } = useVMI(getName(vm), getNamespace(vm), fetchVMI);

  if ((isVMRunning && vmiLoadError) || (!isEmpty(itMatcher) && instanceTypeLoadError))
    return <MutedTextSpan text={t('Not available')} />;

  if ((isVMRunning && !vmi) || !vm || !instanceTypeLoaded)
    return <Skeleton className="pf-m-width-sm" />;

  const cpu = vCPUCount(getCPU(vm)) || getCPU(vmi) || instanceType?.spec?.cpu?.guest;

  const memory = readableSizeUnit(
    getMemory(vm) || instanceType?.spec?.memory?.guest || getMemory(vmi),
  );

  return (
    <span data-test-id="virtual-machine-overview-details-cpu-memory">
      {t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory })}
    </span>
  );
};

export default CPUMemory;
