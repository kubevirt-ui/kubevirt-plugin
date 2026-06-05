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

  const getParam = (filterType: VirtualMachineRowFilterType) =>
    searchParams.get(filterType) || searchParams.get(getRowFilterQueryKey(filterType));

  const vmName = searchParams.get(STATIC_SEARCH_FILTERS.name);
  const ip = getParam(VirtualMachineRowFilterType.IP);
  const project = getParam(VirtualMachineRowFilterType.Project);
  const clusters = getParam(VirtualMachineRowFilterType.Cluster);
  const createdFrom = getParam(VirtualMachineRowFilterType.DateCreatedFrom);
  const createdTo = getParam(VirtualMachineRowFilterType.DateCreatedTo);

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

    if (project) {
      queries.vmQueries.push({ property: 'namespace', values: project.split(',') });
      queries.vmiQueries.push({ property: 'namespace', values: project.split(',') });
    }

    return queries;
  }, [createdFrom, createdTo, vmName, ip, project, clusters]);
};

export default useVMSearchQueries;
