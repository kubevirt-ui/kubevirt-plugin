import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

type DiagnosticsEmptyFilterStateProps = {
  onClearFilters: () => void;
};

const DiagnosticsEmptyFilterState: FC<DiagnosticsEmptyFilterStateProps> = ({ onClearFilters }) => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState
      headingLevel="h4"
      icon={SearchIcon}
      titleText={t('No results found')}
      variant={EmptyStateVariant.sm}
    >
      <EmptyStateBody>
        {t('No items match the current filter criteria. Try adjusting your filters.')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button onClick={onClearFilters} variant={ButtonVariant.link}>
            {t('Clear all filters')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default DiagnosticsEmptyFilterState;
