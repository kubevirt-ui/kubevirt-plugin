import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, EmptyState, EmptyStateBody, EmptyStateVariant } from '@patternfly/react-core';
import { NetworkIcon } from '@patternfly/react-icons';

type AutoAttachedNetworkEmptyStateProps = {
  isAutoAttached: boolean;
};

const AutoAttachedNetworkEmptyState: FC<AutoAttachedNetworkEmptyStateProps> = ({
  isAutoAttached,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Bullseye>
      <EmptyState icon={NetworkIcon} variant={EmptyStateVariant.sm}>
        <EmptyStateBody>
          {isAutoAttached
            ? t(
                "You don't have any network interface definitions yet. The VirtualMachine has no networks and interfaces specified, therefore it's using a default interface and network configuration.",
              )
            : t(
                "You don't have any network interface definitions yet. To get started, add a network interface.",
              )}
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};

export default AutoAttachedNetworkEmptyState;
