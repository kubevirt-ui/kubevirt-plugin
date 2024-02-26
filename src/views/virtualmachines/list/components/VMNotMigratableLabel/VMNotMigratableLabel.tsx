import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { Label, SplitItem } from '@patternfly/react-core';
import { isLiveMigratable, printableVMStatus } from '@virtualmachines/utils';

import './VMNotMigratableLabel.scss';

type VMNotMigratableLabelProps = {
  vm: V1VirtualMachine;
};

const VMNotMigratableLabel: React.FC<VMNotMigratableLabelProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const [isSingleNodeCluster] = useSingleNodeCluster();
  const isMigratable = isLiveMigratable(vm, isSingleNodeCluster);
  const isVMrunning = vm?.status?.printableStatus === printableVMStatus.Running;

  return isVMrunning && !isMigratable ? (
    <SplitItem>
      <Label
        className="migratable-label"
        color="blue"
        isCompact
        key="not-migratable"
        variant="outline"
      >
        {t('Not migratable')}
      </Label>
    </SplitItem>
  ) : null;
};

export default VMNotMigratableLabel;
