import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export type VMSearchQueries = {
  vmiQueries: { key: string; value: string }[];
  vmQueries: { key: string; value: string }[];
};

const useVMSearchQueries = (): VMSearchQueries => {
  const [searchParams] = useSearchParams();

  const vmName = searchParams.get(STATIC_SEARCH_FILTERS.name);

  const ip = searchParams.get(VirtualMachineRowFilterType.IP);
  const project = searchParams.get(VirtualMachineRowFilterType.Project);
  const createdFrom = searchParams.get(VirtualMachineRowFilterType.DateCreatedFrom);
  const createdTo = searchParams.get(VirtualMachineRowFilterType.DateCreatedTo);

  return useMemo(() => {
    const queries: VMSearchQueries = {
      vmiQueries: [],
      vmQueries: [],
    };

    if (createdFrom) {
      queries.vmQueries.push({ key: 'created', value: `>=${createdFrom}` });
    }
    if (createdTo) {
      queries.vmQueries.push({ key: 'created', value: `<=${createdTo}` });
    }

    if (vmName) {
      queries.vmQueries.push({ key: 'name', value: `*${vmName}*` });
      queries.vmiQueries.push({ key: 'name', value: `*${vmName}*` });
    }

    if (ip) queries.vmiQueries.push({ key: 'ipaddress', value: `*${ip}*` });

    if (project) {
      queries.vmQueries.push({ key: 'project', value: project });
      queries.vmiQueries.push({ key: 'project', value: project });
    }

    return queries;
  }, [createdFrom, createdTo, vmName, ip, project]);
};

export default useVMSearchQueries;
