import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, EmptyState } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

const UserProvidedInstanceTypesEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Bullseye>
      <EmptyState
        headingLevel="h2"
        icon={SearchIcon}
        titleText={<>{t('No InstanceTypes found')}</>}
      />
    </Bullseye>
  );
};

export default UserProvidedInstanceTypesEmptyState;
