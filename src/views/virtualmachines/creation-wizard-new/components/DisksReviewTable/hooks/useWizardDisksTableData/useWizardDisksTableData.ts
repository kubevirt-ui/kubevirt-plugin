import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { mapDiskDevicesToRows, resolveDiskDevices } from './utils/utils';

type UseDisksTableDisks = (
  vm: V1VirtualMachine,
  pvcNamespace?: string,
) => [DiskRowDataLayout[], boolean, Error | null];

/**
 * A Hook for getting disks data for a VM
 * @param vm - virtual machine to get disks from
 * @param pvcNamespace - optional namespace to get pvcs from, if not provided vm namespace is used
 * @returns disks data and loading state
 */
const useWizardDisksTableData: UseDisksTableDisks = (vm, pvcNamespace) => {
  const { t } = useKubevirtTranslation();

  const [pvcs, loaded, loadingError] = useK8sWatchData<IoK8sApiCoreV1PersistentVolumeClaim[]>({
    cluster: getCluster(vm),
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    namespace: pvcNamespace ?? vm?.metadata?.namespace,
    namespaced: true,
  });

  const disks = useMemo(() => {
    const diskDevices = resolveDiskDevices(vm, pvcs);
    return mapDiskDevicesToRows(diskDevices, vm, t);
  }, [pvcs, t, vm]);

  return [disks, loaded, loadingError];
};

export default useWizardDisksTableData;
