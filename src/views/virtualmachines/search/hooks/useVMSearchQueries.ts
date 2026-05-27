import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { getRowFilterQueryKey } from '@search/utils/query';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export type VMSearchQueries = {
  vmiQueries: AdvancedSearchFilter;
  vmQueries: AdvancedSearchFilter;
};

const useVMSearchQueries = (): VMSearchQueries => {
  const [searchParams] = useSearchParams();

  const vmName = searchParams.get(STATIC_SEARCH_FILTERS.name);

  const ip = searchParams.get(getRowFilterQueryKey(VirtualMachineRowFilterType.IP));
  const namespace = searchParams.get(getRowFilterQueryKey(VirtualMachineRowFilterType.Namespace));
  const clusters = searchParams.get(getRowFilterQueryKey(VirtualMachineRowFilterType.Cluster));
  const createdFrom = searchParams.get(
    getRowFilterQueryKey(VirtualMachineRowFilterType.DateCreatedFrom),
  );
  const createdTo = searchParams.get(
    getRowFilterQueryKey(VirtualMachineRowFilterType.DateCreatedTo),
  );

  return useMemo(() => {
    const queries: VMSearchQueries = {
      vmiQueries: [],
      vmQueries: [],
    };

    if (createdFrom) {
      queries.vmQueries.push({ property: 'created', values: [`>=${createdFrom}`] });
    }
    if (createdTo) {
      queries.vmQueries.push({ property: 'created', values: [`<=${createdTo}`] });
    }

    if (clusters) {
      queries.vmQueries.push({ property: 'cluster', values: clusters.split(',') });
      queries.vmiQueries.push({ property: 'cluster', values: clusters.split(',') });
    }

    if (vmName) {
      queries.vmQueries.push({ property: 'name', values: [`*${vmName}*`] });
      queries.vmiQueries.push({ property: 'name', values: [`*${vmName}*`] });
    }

    if (ip) queries.vmiQueries.push({ property: 'ipaddress', values: [`*${ip}*`] });

    if (namespace) {
      queries.vmQueries.push({ property: 'namespace', values: namespace.split(',') });
      queries.vmiQueries.push({ property: 'namespace', values: namespace.split(',') });
    }

    return queries;
  }, [createdFrom, createdTo, vmName, ip, namespace, clusters]);
};

export default useVMSearchQueries;
