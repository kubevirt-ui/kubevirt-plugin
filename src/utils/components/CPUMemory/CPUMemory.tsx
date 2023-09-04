import React, { FC } from 'react';

import { V1InstancetypeMatcher, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { vCPUCount } from '@kubevirt-utils/resources/template/utils';
import useInstanceType from '@kubevirt-utils/resources/vm/hooks/useInstanceType';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Skeleton } from '@patternfly/react-core';
import { isVMRunning } from '@virtualmachines/utils';

type CPUMemoryProps = {
  vm: V1VirtualMachine;
};

const CPUMemory: FC<CPUMemoryProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const itMatcher: V1InstancetypeMatcher = vm?.spec?.instancetype;
  const { instanceType, instanceTypeLoaded, instanceTypeLoadError } = useInstanceType(itMatcher);
  const isMachineRunning = isVMRunning(vm);
  const { vmi, vmiLoadError } = useVMI(getName(vm), getNamespace(vm));

  if ((isMachineRunning && vmiLoadError) || (!isEmpty(itMatcher) && instanceTypeLoadError))
    return <MutedTextSpan text={t('Not available')} />;

  if ((isMachineRunning && !vmi) || !vm || !instanceTypeLoaded) return <Skeleton />;

  const cpu =
    vCPUCount(vmi?.spec?.domain?.cpu || vm?.spec?.template?.spec?.domain?.cpu) ||
    instanceType?.spec?.cpu?.guest;

  const memory = readableSizeUnit(
    vmi?.spec?.domain?.memory?.guest ||
      instanceType?.spec?.memory?.guest ||
      (vm?.spec?.template?.spec?.domain?.resources?.requests as { [key: string]: string })?.memory,
  );

  return (
    <span data-test-id="virtual-machine-overview-details-cpu-memory">
      {t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory })}
    </span>
  );
};

export default CPUMemory;
