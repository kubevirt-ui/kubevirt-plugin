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
                "No network interface definitions found. The VirtualMachine has no networks and interfaces specified, therefore it's using a default interface and network configuration.",
              )
            : t(
                'No network interface definitions found. Click the "Add network interface" to define one.',
              )}
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};

export default AutoAttachedNetworkEmptyState;
