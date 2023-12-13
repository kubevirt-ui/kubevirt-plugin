import { useMemo } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getUtilizationQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import useVirtualMachineInstanceMigration from '@kubevirt-utils/resources/vmi/hooks/useVirtualMachineInstanceMigration';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';

import { MIGRATION__PROMETHEUS_DELAY } from '../utils/constants';

type UseMigrationPercentage = (vm: V1VirtualMachine | V1VirtualMachineInstance) => {
  endTimestamp: string;
  isFailed: boolean;
  percentage: number | undefined;
};

const useMigrationPercentage: UseMigrationPercentage = (vm) => {
  const namespace = getNamespace(vm);

  const vmim = useVirtualMachineInstanceMigration(vm);

  const queries = useMemo(() => getUtilizationQueries({ obj: vm }), [vm]);

  const [dataProcessedBytes] = usePrometheusPoll({
    delay: MIGRATION__PROMETHEUS_DELAY,
    endpoint: PrometheusEndpoint?.QUERY,
    namespace,
    query: queries.INSTANT_MIGRATION_DATA_PROCESSED,
  });

  const [dataRemainingBytes] = usePrometheusPoll({
    delay: MIGRATION__PROMETHEUS_DELAY,
    endpoint: PrometheusEndpoint?.QUERY,
    namespace,
    query: queries.INSTANT_MIGRATION_DATA_REMAINING,
  });

  if (vmim?.status?.phase === vmimStatuses.Succeeded)
    return {
      endTimestamp: vmim?.status?.migrationState?.endTimestamp,
      isFailed: false,
      percentage: 100,
    };

  if (!namespace) return { endTimestamp: null, isFailed: false, percentage: null };

  const processedBytes = parseFloat(dataProcessedBytes?.data?.result?.[0]?.value?.[1]);

  const remainingBytes = parseFloat(dataRemainingBytes?.data?.result?.[0]?.value?.[1]);

  if (isNaN(remainingBytes) || isNaN(processedBytes))
    return { endTimestamp: null, isFailed: false, percentage: null };

  if (remainingBytes === 0 && processedBytes === 0)
    return { endTimestamp: null, isFailed: false, percentage: 0 };

  const percentage = processedBytes / (processedBytes + remainingBytes);

  return {
    endTimestamp: null,
    isFailed: vmim?.status?.phase === vmimStatuses.Failed,
    percentage: Math.trunc(percentage * 100),
  };
};

export default useMigrationPercentage;
