import * as React from 'react';

import { bytesFromQuantity } from '@catalog/utils/quantity';
import { PersistentVolumeClaimModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { DiskRawData, DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import {
  getPrintableDiskDrive,
  getPrintableDiskInterface,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseDisksTableDisks = (vm: V1Template) => [DiskRowDataLayout[], boolean, any];

/**
 * A Hook for getting disks data for a VM
 * @param vm - virtual machine to get disks from
 * @returns disks data and loading state
 */
const useTemplateDisksTableData: UseDisksTableDisks = (template: V1Template) => {
  const { t } = useKubevirtTranslation();
  const vm = getTemplateVirtualMachineObject(template);
  const vmDisks = getDisks(vm);
  const vmVolumes = getVolumes(vm);
  const vmDataVolumeTemplates = getDataVolumeTemplates(vm);

  const [pvcs, loaded, loadingError] = useK8sWatchResource<K8sResourceCommon[]>({
    kind: PersistentVolumeClaimModel.kind,
    isList: true,
    namespaced: true,
    namespace: vm?.metadata?.namespace,
  });

  const disks = React.useMemo(() => {
    const diskDevices: DiskRawData[] = vmVolumes?.map((volume) => {
      const disk = vmDisks?.find(({ name }) => name === volume?.name);
      const pvc = pvcs?.find(
        ({ metadata }) =>
          metadata?.name === volume?.persistentVolumeClaim?.claimName ||
          metadata?.name === volume?.dataVolume?.name,
      );
      const dataVolumeTemplate = vmDataVolumeTemplates?.find(
        ({ metadata }) => metadata?.name === volume?.dataVolume?.name,
      );
      return { disk, volume, pvc, dataVolumeTemplate };
    });

    return (diskDevices || []).map((device) => {
      const source = () => {
        if (device?.dataVolumeTemplate?.spec?.sourceRef) {
          return t('PVC (auto upload)');
        }
        if (device?.dataVolumeTemplate?.spec?.source?.http?.url) {
          return t('URL');
        }
        if (device?.volume?.containerDisk) {
          return t('Container (Ephemeral)');
        }

        const sourceName = device?.pvc?.metadata?.name || t('Other');
        return sourceName;
      };

      const size =
        device?.dataVolumeTemplate?.spec?.storage?.resources?.requests?.storage ||
        device?.dataVolumeTemplate?.spec?.pvc?.resources?.requests?.storage;

      const storageClass =
        device?.dataVolumeTemplate?.spec?.storage?.storageClassName ||
        device?.dataVolumeTemplate?.spec?.pvc?.storageClassName ||
        '-';

      return {
        name: device?.disk?.name,
        source: source(),
        size: size ? bytesFromQuantity(size, 2).join('') : '-',
        storageClass,
        interface: getPrintableDiskInterface(device?.disk),
        drive: getPrintableDiskDrive(device?.disk),
        metadata: { name: device?.disk?.name },
        namespace: device?.pvc?.metadata?.namespace,
        isBootDisk: device?.disk?.name === getBootDisk(vm)?.name,
      };
    });
  }, [pvcs, t, vm, vmDataVolumeTemplates, vmDisks, vmVolumes]);

  return [disks || [], loaded, loadingError];
};

export default useTemplateDisksTableData;
