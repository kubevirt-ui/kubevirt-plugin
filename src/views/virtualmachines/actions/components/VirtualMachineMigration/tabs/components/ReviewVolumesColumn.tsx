import React, { FC } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';

import { getVolumeFromPVC } from '../../utils/utils';

type ReviewVolumesColumnProps = {
  pvcsToMigrate: IoK8sApiCoreV1PersistentVolumeClaim[];
  vms: V1VirtualMachine[];
};

const ReviewVolumesColumn: FC<ReviewVolumesColumnProps> = ({ pvcsToMigrate, vms }) => {
  const rows = vms
    .map((vm) => {
      const volumesToMigrate = getVolumeFromPVC(getVolumes(vm), pvcsToMigrate);

      return volumesToMigrate.map((volume) => (
        <div key={volume.name}>
          {vms.length > 1 ? `${getName(vm)}, ` : ''} {volume.name}
        </div>
      ));
    })
    ?.flat();

  return <>{rows}</>;
};

export default ReviewVolumesColumn;
