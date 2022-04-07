import * as React from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const getName = (obj: K8sResourceCommon) => obj?.metadata?.name;

export const getNamespace = (obj: K8sResourceCommon) => obj?.metadata?.namespace;

export const getDisksDescription = (
  vm: V1VirtualMachine,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
  dataVolumes: V1beta1DataVolume[],
) => {
  const disks = getDisks(vm);
  const volumes = getVolumes(vm);
  const dataVolumeTemplates = getDataVolumeTemplates(vm);
  return disks.map((disk) => {
    const description = [disk.name];

    const volume = (volumes || []).find((v) => v.name === disk.name);
    if (volume) {
      if (volume.dataVolume) {
        const dataVolume =
          (dataVolumeTemplates || []).find((dv) => getName(dv) === volume?.dataVolume?.name) ||
          (dataVolumes || []).find(
            (dv) =>
              getName(dv) === volume?.dataVolume?.name && getNamespace(dv) === getNamespace(vm),
          );
        description.push(
          formatBytes(dataVolume?.spec?.storage?.resources?.requests?.storage),
          dataVolume?.spec?.storage?.storageClassName,
        );
      } else if (volume.persistentVolumeClaim) {
        const pvc = pvcs.find((p) => getName(p) === volume?.persistentVolumeClaim?.claimName);
        description.push(
          formatBytes(pvc?.spec?.resources?.requests?.storage),
          pvc?.spec?.storageClassName,
        );
      } else if (volume.containerDisk) {
        description.push('container disk');
      } else if (volume.cloudInitNoCloud) {
        description.push('cloud-init disk');
      }
    }
    return <div key={disk.name}>{description.join(' - ')}</div>;
  });
};
