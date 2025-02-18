import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

const MigrationPolicyFormDescription: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Content component={ContentVariants.p}>
      {t(
        'MigrationPolicy help you differentiate between various workloads. Adding MigrationPolicy will allow you to set priorities and security segregation per each workload.',
      )}
    </Content>
  );
};

export default MigrationPolicyFormDescription;
