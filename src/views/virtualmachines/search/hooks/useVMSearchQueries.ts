import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { isExcludedValue } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getRowFilterQueryKey } from '@search/utils/query';
import { type AdvancedSearchFilter } from '@stolostron/multicluster-sdk';
import { appendDateCreatedSearchQueries } from '@virtualmachines/search/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

type VMSearchQueries = {
  vmiQueries: AdvancedSearchFilter;
  vmQueries: AdvancedSearchFilter;
};

const useVMSearchQueries = (): VMSearchQueries => {
  const [searchParams] = useSearchParams();

  const getParam = (filterType: VirtualMachineRowFilterType): string =>
    searchParams.get(filterType) ?? searchParams.get(getRowFilterQueryKey(filterType)) ?? '';

  const getMultipleParams = (filterType: VirtualMachineRowFilterType): string[] => {
    const values = searchParams.getAll(filterType);
    if (!isEmpty(values)) {
      return values.filter((value) => !isExcludedValue(value));
    }
    // Legacy rowFilter- prefixed params support
    const value = searchParams.get(getRowFilterQueryKey(filterType));
    return value ? value.split(',') : [];
  };

  const vmNames = getMultipleParams(VirtualMachineRowFilterType.Name);
  const ipAddresses = getMultipleParams(VirtualMachineRowFilterType.IP);
  const projects = getMultipleParams(VirtualMachineRowFilterType.Project);
  const clusters = getMultipleParams(VirtualMachineRowFilterType.Cluster);

  const dateCreated = getParam(VirtualMachineRowFilterType.DateCreated);
  const createdFrom = getParam(VirtualMachineRowFilterType.DateCreatedFrom);
  const createdTo = getParam(VirtualMachineRowFilterType.DateCreatedTo);

  return useMemo(() => {
    const queries: VMSearchQueries = {
      vmiQueries: [],
      vmQueries: [],
    };

    appendDateCreatedSearchQueries(queries.vmQueries, {
      createdFrom,
      createdTo,
      dateCreated,
    });

    if (!isEmpty(clusters)) {
      queries.vmQueries.push({ property: 'cluster', values: clusters });
      queries.vmiQueries.push({ property: 'cluster', values: clusters });
    }

    if (!isEmpty(vmNames)) {
      const wildcardNames = vmNames.map((name) => `*${name}*`);
      queries.vmQueries.push({ property: 'name', values: wildcardNames });
      queries.vmiQueries.push({ property: 'name', values: wildcardNames });
    }

    if (!isEmpty(ipAddresses)) {
      const wildcardIPs = ipAddresses.map((ipAddress) => `*${ipAddress}*`);
      queries.vmiQueries.push({ property: 'ipaddress', values: wildcardIPs });
    }

    if (!isEmpty(projects)) {
      queries.vmQueries.push({ property: 'namespace', values: projects });
      queries.vmiQueries.push({ property: 'namespace', values: projects });
    }

    return queries;
  }, [dateCreated, createdFrom, createdTo, vmNames, ipAddresses, projects, clusters]);
};

export default useVMSearchQueries;
