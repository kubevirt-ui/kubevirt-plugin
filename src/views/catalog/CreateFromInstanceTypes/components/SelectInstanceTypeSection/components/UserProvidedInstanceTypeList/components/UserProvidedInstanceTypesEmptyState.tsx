import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, EmptyState, EmptyStateHeader, EmptyStateIcon } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

const UserProvidedInstanceTypesEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Bullseye>
      <EmptyState>
        <EmptyStateHeader
          headingLevel="h2"
          icon={<EmptyStateIcon icon={SearchIcon} />}
          titleText={<>{t('No InstanceTypes found')}</>}
        />
      </EmptyState>
    </Bullseye>
  );
};

export default UserProvidedInstanceTypesEmptyState;
