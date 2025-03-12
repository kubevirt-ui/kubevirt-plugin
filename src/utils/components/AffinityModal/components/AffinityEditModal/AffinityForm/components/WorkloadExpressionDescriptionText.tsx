import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

const WorkloadExpressionDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Content className="text-muted" component={ContentVariants.p}>
      {t('Select workloads that must have all the following expressions.')}
    </Content>
  );
};
export default WorkloadExpressionDescriptionText;
