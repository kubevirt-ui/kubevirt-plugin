import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { NetworkIcon } from '@patternfly/react-icons';

import AddNetworkInterfaceButton from '../AddNetworkInterfaceButton';

type AutoAttachedNetworkEmptyStateProps = {
  vm: V1VirtualMachine;
  isAutoAttached: boolean;
};

const AutoAttachedNetworkEmptyState: FC<AutoAttachedNetworkEmptyStateProps> = ({
  vm,
  isAutoAttached,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={NetworkIcon} />
        <EmptyStateBody>
          {isAutoAttached
            ? t(
                "No network interface definitions found. The VirtualMachine has no networks and interfaces specified, therefore it's using a default interface and network configuration.",
              )
            : t(
                'No network interface definitions found. Click the "Add network interface" to define one.',
              )}
        </EmptyStateBody>
        <AddNetworkInterfaceButton vm={vm} />
      </EmptyState>
    </Bullseye>
  );
};

export default AutoAttachedNetworkEmptyState;
