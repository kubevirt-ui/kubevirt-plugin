import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { resolveDateCreatedValue } from '@search/utils/dateCreatedValues';
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

    const pushDateFrom = (value: string) =>
      queries.vmQueries.push({ property: 'created', values: [`>=${value}`] });
    const pushDateTo = (value: string) =>
      queries.vmQueries.push({ property: 'created', values: [`<=${value}`] });

    if (dateCreated) {
      const resolved = resolveDateCreatedValue(dateCreated);
      if (resolved) {
        pushDateFrom(resolved.from);
        if (resolved.to) {
          pushDateTo(resolved.to);
        }
      }
    } else {
      if (createdFrom) {
        pushDateFrom(createdFrom);
      }
      if (createdTo) {
        pushDateTo(createdTo);
      }
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
  }, [dateCreated, createdFrom, createdTo, vmName, ip, projects, clusters]);
};

export default useVMSearchQueries;
