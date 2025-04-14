import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

const NodeExpressionDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Content className="pf-v6-u-text-color-subtle" component={ContentVariants.p}>
        {t('Select Nodes that must have all the following expressions.')}
      </Content>
      <Content className="pf-v6-u-text-color-subtle" component={ContentVariants.p}>
        {t('Label selectors let you select Nodes based on the value of one or more labels.')}
      </Content>
      <Content className="pf-v6-u-text-color-subtle" component={ContentVariants.p}>
        {t('A list of matching Nodes will be provided on label input below.')}
      </Content>
    </>
  );
};
export default NodeExpressionDescriptionText;
