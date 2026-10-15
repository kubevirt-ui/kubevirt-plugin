import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

type NoResultsProps = {
  noItemsFoundTitle: string;
};

const NoResults: FC<NoResultsProps> = ({ noItemsFoundTitle }) => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState headingLevel="h4" icon={SearchIcon} titleText={noItemsFoundTitle}>
      <EmptyStateBody>{t('No results match the filter criteria.')}</EmptyStateBody>
    </EmptyState>
  );
};

export default NoResults;
