import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { Label, SplitItem } from '@patternfly/react-core';
import { isLiveMigratable } from '@virtualmachines/utils';

import './VMNotMigratableLabel.scss';

type VMNotMigratableLabelProps = {
  vm: V1VirtualMachine;
};

const VMNotMigratableLabel: React.FC<VMNotMigratableLabelProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const [isSingleNodeCluster] = useSingleNodeCluster();
  const isMigratable = isLiveMigratable(vm, isSingleNodeCluster);

  return !isMigratable ? (
    <SplitItem>
      <Label isCompact variant="outline" key="not-migratable" className="migratable-label">
        {t('Not migratable')}
      </Label>
    </SplitItem>
  ) : null;
};

export default VMNotMigratableLabel;
