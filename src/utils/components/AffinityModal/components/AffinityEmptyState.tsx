import React, { FC } from 'react';

import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyStateVariant } from '@patternfly/react-core';

import AddAffinityRuleButton from './AddAffinityRuleButton';
import AffinityDescriptionText from './AffinityDescriptionText';

type AffinityEmptyStateProps = {
  onAffinityClickAdd: () => void;
};

const AffinityEmptyState: FC<AffinityEmptyStateProps> = ({ onAffinityClickAdd }) => {
  const { t } = useKubevirtTranslation();
  return (
    <ListEmptyState
      bodyContent={<AffinityDescriptionText />}
      buttonAction={<AddAffinityRuleButton onAffinityClickAdd={onAffinityClickAdd} />}
      headingLevel="h5"
      icon={null}
      titleText={t("You don't have any affinity rules yet")}
      variant={EmptyStateVariant.full}
    />
  );
};

export default AffinityEmptyState;
