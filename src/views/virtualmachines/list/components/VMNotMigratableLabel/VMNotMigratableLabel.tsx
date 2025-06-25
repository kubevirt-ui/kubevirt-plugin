import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label } from '@patternfly/react-core';
import { isLiveMigratable, printableVMStatus } from '@virtualmachines/utils';

import './VMNotMigratableLabel.scss';

type VMNotMigratableLabelProps = {
  vm: V1VirtualMachine;
};

const VMNotMigratableLabel: FC<VMNotMigratableLabelProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const isMigratable = isLiveMigratable(vm);
  const isRunning = vm?.status?.printableStatus === printableVMStatus.Running;

  if (!isRunning || isMigratable) return null;

  return (
    <Label
      className="migratable-label"
      color="blue"
      isCompact
      key="not-migratable"
      variant="outline"
    >
      {t('Not migratable')}
    </Label>
  );
};

export default VMNotMigratableLabel;
