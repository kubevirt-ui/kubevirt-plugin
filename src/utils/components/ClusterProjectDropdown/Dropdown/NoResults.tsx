import React, { FC, JSX } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, EmptyState, EmptyStateBody } from '@patternfly/react-core';

type NoResultsProps = {
  noItemsFoundTitle: string;
};

const NoResults: FC<NoResultsProps> = ({ noItemsFoundTitle }): JSX.Element => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Divider />
      <EmptyState headingLevel="h4" titleText={noItemsFoundTitle}>
        <EmptyStateBody>{t('No results match the filter criteria.')}</EmptyStateBody>
      </EmptyState>
    </>
  );
};

export default NoResults;
