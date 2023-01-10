import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { Badge, SplitItem } from '@patternfly/react-core';
import { isLiveMigratable } from '@virtualmachines/utils';

type VMNotMigratableBadgeProps = {
  vm: V1VirtualMachine;
};

const VMNotMigratableBadge: React.FC<VMNotMigratableBadgeProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const [isSingleNodeCluster] = useSingleNodeCluster();
  const isMigratable = isLiveMigratable(vm, isSingleNodeCluster);

  return !isMigratable ? (
    <SplitItem>
      <Badge key="available-boot">{t('Not migratable')}</Badge>
    </SplitItem>
  ) : null;
};

export default VMNotMigratableBadge;
