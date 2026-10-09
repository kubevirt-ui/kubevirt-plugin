import { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import BaseISOBadge from '@kubevirt-utils/components/ISOBadge/ISOBadge';
import { getDisks } from '@kubevirt-utils/resources/vm';
import { isCDROMDisk } from '@kubevirt-utils/resources/vm/utils/disk/selectors';

type ISOBadgeProps = {
  diskName: string;
  vm: V1VirtualMachine;
};

const ISOBadge: FC<ISOBadgeProps> = ({ diskName, vm }) => {
  const disks = getDisks(vm) ?? [];
  const disk = disks.find((vmDisk) => vmDisk.name === diskName);

  if (!disk || !isCDROMDisk(disk)) {
    return null;
  }

  return <BaseISOBadge name={disk.name} />;
};

export default ISOBadge;
