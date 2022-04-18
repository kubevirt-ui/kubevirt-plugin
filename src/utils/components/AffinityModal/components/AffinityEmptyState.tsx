import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStatePrimary,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';

import AddAffinityRuleButton from './AddAffinityRuleButton';
import AffinityDescriptionText from './AffinityDescriptionText';

type AffinityEmptyStateProps = {
  onAffinityClickAdd: () => void;
};

const AffinityEmptyState: React.FC<AffinityEmptyStateProps> = ({ onAffinityClickAdd }) => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.full}>
      <Title headingLevel="h5" size="lg">
        {t('No affinity rules found')}
      </Title>
      <EmptyStateBody>
        <AffinityDescriptionText />
      </EmptyStateBody>
      <EmptyStatePrimary>
        <AddAffinityRuleButton onAffinityClickAdd={onAffinityClickAdd} />
      </EmptyStatePrimary>
    </EmptyState>
  );
};

export default AffinityEmptyState;
