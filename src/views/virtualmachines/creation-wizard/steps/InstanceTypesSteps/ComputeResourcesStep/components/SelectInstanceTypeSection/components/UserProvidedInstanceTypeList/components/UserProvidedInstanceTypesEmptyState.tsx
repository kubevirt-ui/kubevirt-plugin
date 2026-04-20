import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, EmptyState } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

const UserProvidedInstanceTypesEmptyState: FCC = () => {
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
