import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

import QuotasCreateButton from './QuotasCreateButton';
import QuotasLearnMoreLink from './QuotasLearnMoreLink';

type QuotasEmptyStateProps = {
  namespace?: string;
};

const QuotasEmptyState: FC<QuotasEmptyStateProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState
      headingLevel="h4"
      icon={AddCircleOIcon}
      titleText={t('No application-aware quotas found')}
      variant="sm"
    >
      <EmptyStateBody>
        <Trans t={t}>
          Click <b>Create quota</b> to create your first application-aware quota to limit VMs, pods,
          or both.
        </Trans>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <QuotasCreateButton namespace={namespace} />
        </EmptyStateActions>
        <EmptyStateActions>
          <QuotasLearnMoreLink />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default QuotasEmptyState;
