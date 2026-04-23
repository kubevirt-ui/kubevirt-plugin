import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import {
  getPrintableDiskDrive,
  getPrintableDiskInterface,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

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
      const source = () => {
        if (device?.dataVolumeTemplate?.spec?.sourceRef) {
          return t('PVC (auto import)');
        }
        if (device?.dataVolumeTemplate?.spec?.source?.http?.url) {
          return t('URL');
        }
        if (device?.volume?.containerDisk) {
          return t('Container (Ephemeral)');
        }
        if (device?.volume?.persistentVolumeClaim?.claimName) {
          return device.volume.persistentVolumeClaim.claimName;
        }
        if (device?.volume?.dataVolume?.name) {
          return device.volume.dataVolume.name;
        }
        if (!device?.volume && device?.disk?.cdrom) {
          return t('Empty');
        }

        const sourceName = device?.pvc?.metadata?.name || t('Other');
        return sourceName;
      };

      const size =
        device?.dataVolumeTemplate?.spec?.storage?.resources?.requests?.storage ||
        device?.dataVolumeTemplate?.spec?.pvc?.resources?.requests?.storage ||
        device?.pvc?.spec?.resources?.requests?.storage;

      const storageClass =
        device?.dataVolumeTemplate?.spec?.storage?.storageClassName ||
        device?.dataVolumeTemplate?.spec?.pvc?.storageClassName ||
        device?.pvc?.spec?.storageClassName ||
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
        source: source(),
        storageClass,
      };
    });
  }, [pvcs, t, vm, vmDataVolumeTemplates, vmDisks, vmVolumes]);

  return [disks || [], loaded, loadingError];
};

export default useWizardDisksTableData;
