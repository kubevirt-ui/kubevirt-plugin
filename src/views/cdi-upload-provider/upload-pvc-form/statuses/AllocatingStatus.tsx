import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';

const AllocatingStatus: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState headingLevel="h4" icon={Spinner} titleText={t('Allocating resources')}>
      <EmptyStateBody>
        {t(
          'Please wait, once the Data Volume has been created the data will start uploading into this Persistent Volume Claims.',
        )}
      </EmptyStateBody>
    </EmptyState>
  );
};

export default AllocatingStatus;
