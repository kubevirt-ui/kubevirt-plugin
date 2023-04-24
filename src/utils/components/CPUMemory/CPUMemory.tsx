import React, { FC } from 'react';

import {
  VirtualMachineClusterInstancetypeModelGroupVersionKind,
  VirtualMachineInstancetypeModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  V1alpha2VirtualMachineInstancetype,
  V1InstancetypeMatcher,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vCPUCount } from '@kubevirt-utils/resources/template/utils';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Skeleton } from '@patternfly/react-core';

type CPUMemoryProps = {
  vm: V1VirtualMachine;
};

const CPUMemory: FC<CPUMemoryProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const it: V1InstancetypeMatcher = vm?.spec?.instancetype;

  const [instanceType, loaded, error] = useK8sWatchResource<V1alpha2VirtualMachineInstancetype>(
    !isEmpty(it) && {
      groupVersionKind: it.kind.includes('cluster')
        ? VirtualMachineClusterInstancetypeModelGroupVersionKind
        : VirtualMachineInstancetypeModelGroupVersionKind,
      name: it.name,
    },
  );

  if (error && !isEmpty(it)) return <MutedTextSpan text={t('Not available')} />;

  if (!vm || !loaded) return <Skeleton />;

  const cpu = instanceType?.spec?.cpu?.guest || vCPUCount(vm?.spec?.template?.spec?.domain?.cpu);

  const memory = readableSizeUnit(
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
