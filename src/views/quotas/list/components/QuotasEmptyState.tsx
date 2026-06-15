import React, { FC } from 'react';

import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyStateVariant } from '@patternfly/react-core';

import QuotasCreateButton from './QuotasCreateButton';
import QuotasLearnMoreLink from './QuotasLearnMoreLink';

type QuotasEmptyStateProps = {
  namespace?: string;
};

const QuotasEmptyState: FC<QuotasEmptyStateProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ListEmptyState
      bodyContent={t(
        'To get started, create an application-aware quota to limit VMs, pods, or both.',
      )}
      buttonAction={<QuotasCreateButton namespace={namespace} />}
      learnMoreLink={<QuotasLearnMoreLink />}
      titleText={t("You don't have any application-aware quotas yet")}
      variant={EmptyStateVariant.sm}
    />
  );
};

export default QuotasEmptyState;
