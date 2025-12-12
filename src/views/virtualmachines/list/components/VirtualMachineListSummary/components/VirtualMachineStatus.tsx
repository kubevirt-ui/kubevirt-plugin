import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vmStatusIcon } from '@overview/OverviewTab/vm-statuses-card/utils/utils';

type VirtualMachineStatusProps = {
  count: number;
  statusLabel: string;
};

const VirtualMachineStatus: FC<VirtualMachineStatusProps> = ({ count, statusLabel }) => {
  const { t } = useKubevirtTranslation();

  const Icon = vmStatusIcon[statusLabel];

  return (
    <div>
      <Icon />
      <span className="pf-v6-u-ml-sm">
        {count.toString()} {t(statusLabel)}
      </span>
    </div>
  );
};

export default VirtualMachineStatus;
