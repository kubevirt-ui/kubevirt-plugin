import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDisks } from '@kubevirt-utils/resources/vm';
import { isCDROMDisk } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { Badge, Popover, PopoverPosition } from '@patternfly/react-core';

type ISOBadgeProps = {
  diskName: string;
  vm: V1VirtualMachine;
};

const ISOBadge: FC<ISOBadgeProps> = ({ diskName, vm }) => {
  const { t } = useKubevirtTranslation();

  const disks = getDisks(vm) || [];
  const disk = disks.find((vmDisk) => vmDisk.name === diskName);

  if (!disk || !isCDROMDisk(disk)) {
    return null;
  }

  return (
    <Popover
      bodyContent={diskName}
      hasAutoWidth
      position={PopoverPosition.top}
      triggerAction="hover"
    >
      <Badge isRead>{t('ISO')}</Badge>
    </Popover>
  );
};

export default ISOBadge;
