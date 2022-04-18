import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';

const WorkloadExpressionDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Text className="text-muted" component={TextVariants.p}>
      {t('Select workloads that must have all the following expressions.')}
    </Text>
  );
};
export default WorkloadExpressionDescriptionText;
