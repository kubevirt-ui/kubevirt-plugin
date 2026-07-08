import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getRowFilterQueryKey } from '@search/utils/query';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';
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
    if (!isEmpty(values)) return values;
    const value = searchParams.get(getRowFilterQueryKey(filterType));
    return value ? value.split(',') : [];
  };

  const vmName = getParam(VirtualMachineRowFilterType.Name);
  const ipAddress = getParam(VirtualMachineRowFilterType.IP);
  const dateCreated = getParam(VirtualMachineRowFilterType.DateCreated);
  const createdFrom = getParam(VirtualMachineRowFilterType.DateCreatedFrom);
  const createdTo = getParam(VirtualMachineRowFilterType.DateCreatedTo);

  const projects = getMultipleParams(VirtualMachineRowFilterType.Project);
  const clusters = getMultipleParams(VirtualMachineRowFilterType.Cluster);

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

    if (vmName) {
      queries.vmQueries.push({ property: 'name', values: [`*${vmName}*`] });
      queries.vmiQueries.push({ property: 'name', values: [`*${vmName}*`] });
    }

    if (ipAddress) {
      queries.vmiQueries.push({ property: 'ipaddress', values: [`*${ipAddress}*`] });
    }

    if (!isEmpty(projects)) {
      queries.vmQueries.push({ property: 'namespace', values: projects });
      queries.vmiQueries.push({ property: 'namespace', values: projects });
    }

    return queries;
  }, [dateCreated, createdFrom, createdTo, vmName, ipAddress, projects, clusters]);
};

export default useVMSearchQueries;
