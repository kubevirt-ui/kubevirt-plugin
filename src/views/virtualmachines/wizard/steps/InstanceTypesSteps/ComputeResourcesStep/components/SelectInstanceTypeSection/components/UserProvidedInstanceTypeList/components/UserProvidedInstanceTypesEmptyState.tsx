import React, { FC } from 'react';

import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

type UserProvidedInstanceTypesEmptyStateProps = {
  isFilterEmpty?: boolean;
};

const UserProvidedInstanceTypesEmptyState: FC<UserProvidedInstanceTypesEmptyStateProps> = ({
  isFilterEmpty,
}) => {
  const { t } = useKubevirtTranslation();

  const titleText = isFilterEmpty
    ? t('No InstanceTypes found')
    : t("You don't have any InstanceTypes yet");

  return (
    <Bullseye>
      <ListEmptyState headingLevel="h2" icon={SearchIcon} titleText={titleText} />
    </Bullseye>
  );
};

export default UserProvidedInstanceTypesEmptyState;
