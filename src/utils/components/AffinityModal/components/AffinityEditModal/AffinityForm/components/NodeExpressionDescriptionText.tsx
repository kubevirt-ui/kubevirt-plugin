import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';

const NodeExpressionDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Text className="text-muted" component={TextVariants.p}>
        {t('Select Nodes that must have all the following expressions.')}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t('Label selectors let you select Nodes based on the value of one or more labels.')}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t('A list of matching Nodes will be provided on label input below.')}
      </Text>
    </>
  );
};
export default NodeExpressionDescriptionText;
