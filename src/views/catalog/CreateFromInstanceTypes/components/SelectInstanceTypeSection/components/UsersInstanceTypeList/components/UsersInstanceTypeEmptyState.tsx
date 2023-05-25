import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, EmptyState, EmptyStateIcon, Title } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

const UsersInstanceTypeEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Bullseye>
      <EmptyState>
        <EmptyStateIcon icon={SearchIcon} />
        <Title headingLevel="h2" size="lg">
          {t('No InstanceTypes found.')}
        </Title>
      </EmptyState>
    </Bullseye>
  );
};

export default UsersInstanceTypeEmptyState;
