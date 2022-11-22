import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyStateBody, EmptyStateIcon, Spinner, Title } from '@patternfly/react-core';

const AllocatingStatus: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <EmptyStateIcon icon={Spinner} />
      <Title headingLevel="h4" size="lg">
        {t('Allocating resources')}
      </Title>
      <EmptyStateBody>
        {t(
          'Please wait, once the Data Volume has been created the data will start uploading into this Persistent Volume Claims.',
        )}
      </EmptyStateBody>
    </>
  );
};

export default AllocatingStatus;
