import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export type VMSearchQueries = {
  vmiQueries: { [key: string]: string };
  vmQueries: { [key: string]: string };
};

const useVMSearchQueries = (): VMSearchQueries => {
  const [searchParams] = useSearchParams();

  const vmName = searchParams.get(STATIC_SEARCH_FILTERS.name);

  const ip = searchParams.get(VirtualMachineRowFilterType.IP);
  const project = searchParams.get(VirtualMachineRowFilterType.Project);

  return useMemo(() => {
    const queries: VMSearchQueries = {
      vmiQueries: {},
      vmQueries: {},
    };

    if (vmName) {
      queries.vmQueries.name = `*${vmName}*`;
      queries.vmiQueries.name = `*${vmName}*`;
    }

    if (ip) queries.vmiQueries.ipaddress = `*${ip}*`;

    if (project) {
      queries.vmQueries.project = project;
      queries.vmiQueries.project = project;
    }

    return queries;
  }, [vmName, ip, project]);
};

export default useVMSearchQueries;
