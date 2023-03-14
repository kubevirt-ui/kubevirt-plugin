import React, { FC } from 'react';

import {
  V1alpha2VirtualMachineInstancetype,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vCPUCount } from '@kubevirt-utils/resources/template/utils';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Skeleton } from '@patternfly/react-core';

type CPUMemoryProps = {
  vm: V1VirtualMachine;
};

const CPUMemory: FC<CPUMemoryProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const [instanceType, loaded] = useK8sWatchResource<V1alpha2VirtualMachineInstancetype>(
    vm?.spec?.instancetype?.name && {
      groupVersionKind: {
        group: 'instancetype.kubevirt.io',
        version: 'v1alpha2',
        kind: 'VirtualMachineInstancetype',
      },
      name: vm?.spec?.instancetype?.name,
    },
  );

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
