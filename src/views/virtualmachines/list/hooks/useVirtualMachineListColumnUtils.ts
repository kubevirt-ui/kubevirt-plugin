import { useMemo } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { usePVCMapper } from '@kubevirt-utils/hooks/usePVCMapper';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useVirtualMachineInstanceMigrationMapper from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrationMapper';
import useVirtualMachineInstanceMigrations from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrations';
import { getCluster } from '@multicluster/helpers/selectors';

import { type VMCallbacks } from '../virtualMachinesDefinition';

import {
  getVMIFromMapper,
  getVMIMFromMapper,
  type PVCMapper,
  type VMIMapper,
  type VMIMMapper,
} from '../../utils/mappers';
import { useVirtualMachineInstanceMapper } from './useVirtualMachineInstanceMapper';

const useVirtualMachineListColumnUtils = (
  cluster?: string,
  namespace?: string,
): {
  callbacks: VMCallbacks;
  loaded: boolean;
  pvcMapper: PVCMapper;
  vmiMapper: VMIMapper;
  vmimMapper: VMIMMapper;
} => {
  const vmiResults = useVirtualMachineInstanceMigrations(cluster, namespace);
  const vmims = vmiResults[0];
  const vmimsLoaded = vmiResults[1];

  const { vmiMapper, vmisLoaded } = useVirtualMachineInstanceMapper();

  const vmimMapper = useVirtualMachineInstanceMigrationMapper(vmims);
  const pvcMapper = usePVCMapper(namespace, cluster);

  const callbacks: VMCallbacks = useMemo(
    () => ({
      getVmi: (virtunalMachine: V1VirtualMachine) => getVMIFromMapper(vmiMapper, virtunalMachine),
      getVmim: (virtunalMachine: V1VirtualMachine) =>
        getVMIMFromMapper(
          vmimMapper,
          getName(virtunalMachine),
          getNamespace(virtunalMachine),
          getCluster(virtunalMachine),
        ),
      pvcMapper,
      vmiMapper,
      vmimMapper,
    }),
    [vmiMapper, vmimMapper, pvcMapper],
  );

  return { callbacks, loaded: vmisLoaded && vmimsLoaded, pvcMapper, vmiMapper, vmimMapper };
};

export default useVirtualMachineListColumnUtils;
