import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export type VMSearchQueries = {
  vmiQueries: AdvancedSearchFilter;
  vmQueries: AdvancedSearchFilter;
};

const useVMSearchQueries = (): VMSearchQueries => {
  const [searchParams] = useSearchParams();

  const vmName = searchParams.get(STATIC_SEARCH_FILTERS.name);

  const ip = searchParams.get(VirtualMachineRowFilterType.IP);
  const project = searchParams.get(VirtualMachineRowFilterType.Project);
  const clusters = searchParams.get(VirtualMachineRowFilterType.Cluster);
  const createdFrom = searchParams.get(VirtualMachineRowFilterType.DateCreatedFrom);
  const createdTo = searchParams.get(VirtualMachineRowFilterType.DateCreatedTo);

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
