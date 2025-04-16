import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

const NodeFieldsDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Content className="pf-v6-u-text-color-subtle" component={ContentVariants.p}>
        {t(
          'Field selectors let you select Nodes based on the value of one or more resource fields.',
        )}
      </Content>
      <Content className="pf-v6-u-text-color-subtle" component={ContentVariants.p}>
        {t(
          'Note that for Node field expressions, entering a full path is required in the "Key" field (e.g. "metadata.name: value").',
        )}
      </Content>
      <Content className="pf-v6-u-text-color-subtle" component={ContentVariants.p}>
        {t('Some fields may not be supported.')}
      </Content>
    </>
  );
};
export default NodeFieldsDescriptionText;
