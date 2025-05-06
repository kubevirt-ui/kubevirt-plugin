import { useMemo } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { PVCMapper, VMIMapper, VMIMMapper } from '../../../utils/mappers';
import { getLatestMigrationForEachVM } from '../../../utils/utils';

import { useCPUFilter } from './useCPUFilter';
import { useDateFilter } from './useDateFilter';
import { useDescriptionFilter } from './useDescriptionFilter';
import { useInstanceTypesFilter } from './useInstanceTypesFilter';
import { useIPSearchFilter } from './useIPSearchFilter';
import { useLiveMigratableFilter } from './useLiveMigratableFilter';
import { useMemoryFilter } from './useMemoryFilter';
import { useNodesFilter } from './useNodesFilter';
import { useOSFilter } from './useOSFilter';
import { useProjectFilter } from './useProjectFilter';
import { useStatusFilter } from './useStatusFilter';
import { useStorageClassFilter } from './useStorageClassFilter';
import { useTemplatesFilter } from './useTemplatesFilter';

export const useVMListFilters = (
  vmis: V1VirtualMachineInstance[],
  vms: V1VirtualMachine[],
  vmims: V1VirtualMachineInstanceMigration[],
  pvcMapper: PVCMapper,
): {
  advancedFilters: RowFilter<V1VirtualMachine>[];
  filters: RowFilter<V1VirtualMachine>[];
  projectFilter: RowFilter<V1VirtualMachine>;
  searchFilters: RowFilter<V1VirtualMachine>[];
  vmiMapper: VMIMapper;
  vmimMapper: VMIMMapper;
} => {
  const vmiMapper: VMIMapper = useMemo(() => {
    return (Array.isArray(vmis) ? vmis : [])?.reduce(
      (acc, vmi) => {
        const name = vmi?.metadata?.name;
        const namespace = vmi?.metadata?.namespace;
        if (!acc.mapper[namespace]) {
          acc.mapper[namespace] = {};
        }
        acc.mapper[namespace][name] = vmi;
        const nodeName = vmi?.status?.nodeName;
        if (nodeName && !acc?.nodeNames?.[nodeName]) {
          acc.nodeNames[nodeName] = {
            id: nodeName,
            title: nodeName,
          };
        }
        return acc;
      },
      { mapper: {}, nodeNames: {} },
    );
  }, [vmis]);

  const vmimMapper: VMIMMapper = useMemo(() => getLatestMigrationForEachVM(vmims), [vmims]);

  const statusFilter = useStatusFilter();
  const templatesFilter = useTemplatesFilter(vms);
  const osFilters = useOSFilter();
  const nodesFilter = useNodesFilter(vmiMapper);
  const liveMigratableFilter = useLiveMigratableFilter();
  const instanceTypesFilter = useInstanceTypesFilter(vms);
  const storageClassFilters = useStorageClassFilter(vms, pvcMapper);

  const projectFilter = useProjectFilter();
  const dateFromFilter = useDateFilter('from');
  const dateToFilter = useDateFilter('to');
  const cpuFilter = useCPUFilter(vmiMapper);
  const memoryFilter = useMemoryFilter(vmiMapper);

  const searchByIP = useIPSearchFilter(vmiMapper);
  const searchByDescription = useDescriptionFilter();

  return {
    advancedFilters: [dateFromFilter, dateToFilter, cpuFilter, memoryFilter],
    filters: [
      statusFilter,
      templatesFilter,
      osFilters,
      liveMigratableFilter,
      nodesFilter,
      instanceTypesFilter,
      storageClassFilters,
    ],
    projectFilter,
    searchFilters: [searchByIP, searchByDescription],
    vmiMapper,
    vmimMapper,
  };
};
