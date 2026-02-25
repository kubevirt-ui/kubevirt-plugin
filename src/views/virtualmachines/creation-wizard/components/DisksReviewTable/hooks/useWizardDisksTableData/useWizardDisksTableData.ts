import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getPVCSize,
  getPVCStorageClassName,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  getDataVolumePVCStorageClassName,
  getDataVolumePVCStorageRequest,
  getDataVolumeStorageClassName,
  getDataVolumeStorageRequest,
} from '@kubevirt-utils/resources/vm/utils/dataVolumeTemplate/selectors';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import {
  getPrintableDiskDrive,
  getPrintableDiskInterface,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { getSource } from '@virtualmachines/creation-wizard/components/DisksReviewTable/hooks/useWizardDisksTableData/utils';

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
  const vmDisks = getDisks(vm);
  const vmVolumes = getVolumes(vm);
  const vmDataVolumeTemplates = getDataVolumeTemplates(vm);

  const [pvcs, loaded, loadingError] = useK8sWatchData<IoK8sApiCoreV1PersistentVolumeClaim[]>({
    cluster: getCluster(vm),
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    namespace: pvcNamespace ?? vm?.metadata?.namespace,
    namespaced: true,
  });

  const disks = useMemo(() => {
    const diskDevices = vmDisks?.map((disk) => {
      const volume = vmVolumes?.find(({ name }) => name === disk?.name);
      const pvcClaimName = volume?.persistentVolumeClaim?.claimName || volume?.dataVolume?.name;
      const pvc = pvcs?.find(({ metadata }) => metadata?.name === pvcClaimName);
      const dataVolumeTemplate = vmDataVolumeTemplates?.find(
        ({ metadata }) => metadata?.name === volume?.dataVolume?.name,
      );
      return { dataVolumeTemplate, disk, pvc, volume };
    });

    return (diskDevices || []).map((device) => {
      const size =
        getDataVolumeStorageRequest(device?.dataVolumeTemplate) ||
        getDataVolumePVCStorageRequest(device?.dataVolumeTemplate) ||
        getPVCSize(device?.pvc);

      const storageClass =
        getDataVolumeStorageClassName(device?.dataVolumeTemplate) ||
        getDataVolumePVCStorageClassName(device?.dataVolumeTemplate) ||
        getPVCStorageClassName(device?.pvc) ||
        NO_DATA_DASH;

      return {
        drive: getPrintableDiskDrive(device?.disk),
        interface: getPrintableDiskInterface(device?.disk),
        isBootDisk: device?.disk?.name === getBootDisk(vm)?.name,
        isEnvDisk:
          !!device?.volume?.configMap ||
          !!device?.volume?.secret ||
          !!device?.volume?.serviceAccount,
        metadata: { name: device?.disk?.name },
        name: device?.disk?.name,
        namespace: device?.pvc?.metadata?.namespace,
        size: size ? getHumanizedSize(size).string : NO_DATA_DASH,
        source: getSource(device, t),
        storageClass,
      };
    });
  }, [pvcs, t, vm, vmDataVolumeTemplates, vmDisks, vmVolumes]);

  return [disks || [], loaded, loadingError];
};

export default useWizardDisksTableData;
