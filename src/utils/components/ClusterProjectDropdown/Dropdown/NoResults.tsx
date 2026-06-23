import React, { FC, MouseEvent } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

type NoResultsProps = {
  noItemsFoundTitle: string;
  onClear: (event: MouseEvent<HTMLButtonElement>) => void;
};

const NoResults: FC<NoResultsProps> = ({ noItemsFoundTitle, onClear }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Divider />
      <EmptyState headingLevel="h4" icon={SearchIcon} titleText={noItemsFoundTitle}>
        <EmptyStateBody>{t('No results match the filter criteria.')}</EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button onClick={onClear} variant="link">
              {t('Clear filters')}
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    </>
  );
};

export default NoResults;
