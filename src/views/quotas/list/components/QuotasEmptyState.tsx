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
      titleText={t('No virtualization quotas found')}
    >
      <EmptyStateBody>
        <Trans t={t}>
          Click <b>Create quota</b> to create your first virtualization quota
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
