import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { NODE_NETWORK_CONFIGURATION_WIZARD_PATH } from '../utils/constants';

const PhysicalNetworksEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  return (
    <EmptyState
      headingLevel="h4"
      icon={PlusCircleIcon}
      titleText={t('No physical networks defined yet')}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        {t(
          'A physical network establishes a specific network configuration on cluster nodes. To get started, create a physical network.',
        )}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button onClick={() => history.push(NODE_NETWORK_CONFIGURATION_WIZARD_PATH)}>
            {t('Create network')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default PhysicalNetworksEmptyState;
