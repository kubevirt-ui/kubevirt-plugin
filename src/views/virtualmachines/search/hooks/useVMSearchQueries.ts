import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getRowFilterQueryKey } from '@search/utils/query';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

type VMSearchQueries = {
  vmiQueries: AdvancedSearchFilter;
  vmQueries: AdvancedSearchFilter;
};

const useVMSearchQueries = (): VMSearchQueries => {
  const [searchParams] = useSearchParams();

  const getParam = (filterType: VirtualMachineRowFilterType): string =>
    searchParams.get(filterType) || searchParams.get(getRowFilterQueryKey(filterType));

  const getMultipleParams = (filterType: VirtualMachineRowFilterType): string[] => {
    const values = searchParams.getAll(filterType);
    if (!isEmpty(values)) return values;
    const value = searchParams.get(getRowFilterQueryKey(filterType));
    return value ? value.split(',') : [];
  };

  const vmName = getParam(VirtualMachineRowFilterType.Name);
  const ip = getParam(VirtualMachineRowFilterType.IP);
  const createdFrom = getParam(VirtualMachineRowFilterType.DateCreatedFrom);
  const createdTo = getParam(VirtualMachineRowFilterType.DateCreatedTo);

  const projects = getMultipleParams(VirtualMachineRowFilterType.Project);
  const clusters = getMultipleParams(VirtualMachineRowFilterType.Cluster);

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

    if (!isEmpty(clusters)) {
      queries.vmQueries.push({ property: 'cluster', values: clusters });
      queries.vmiQueries.push({ property: 'cluster', values: clusters });
    }

    if (vmName) {
      queries.vmQueries.push({ property: 'name', values: [`*${vmName}*`] });
      queries.vmiQueries.push({ property: 'name', values: [`*${vmName}*`] });
    }

    if (ip) queries.vmiQueries.push({ property: 'ipaddress', values: [`*${ip}*`] });

    if (!isEmpty(projects)) {
      queries.vmQueries.push({ property: 'namespace', values: projects });
      queries.vmiQueries.push({ property: 'namespace', values: projects });
    }

    return queries;
  }, [createdFrom, createdTo, vmName, ip, projects, clusters]);
};

export default useVMSearchQueries;
