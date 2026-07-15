import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

import ManageVirtualMachinesButton from '../../list/components/ManageVirtualMachinesButton/ManageVirtualMachinesButton';

type NodeVirtualMachineEmptyStateProps = {
  nodeName: string;
};

const NodeVirtualMachineEmptyState: FC<NodeVirtualMachineEmptyStateProps> = ({ nodeName }) => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState
      headingLevel="h2"
      icon={VirtualMachineIcon}
      titleText={t('Node {{nodeName}} does not have any VirtualMachines yet', { nodeName })}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        <div>
          {t(
            'To get started, manage your VirtualMachines and create a VirtualMachine for the node.',
          )}
        </div>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <ManageVirtualMachinesButton variant={ButtonVariant.primary} />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default NodeVirtualMachineEmptyState;
