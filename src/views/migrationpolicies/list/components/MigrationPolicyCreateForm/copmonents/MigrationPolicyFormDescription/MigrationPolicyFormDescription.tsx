import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';

const MigrationPolicyFormDescription: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Text component={TextVariants.p}>
      {t(
        'MigrationPolicy help you differentiate between various workloads. Adding MigrationPolicy will allow you to set priorities and security segregation per each workload.',
      )}
    </Text>
  );
};

export default MigrationPolicyFormDescription;
