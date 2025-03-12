import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

const AffinityDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Content className="text-muted" component={ContentVariants.p}>
        {t(
          'Set scheduling requirements and affect the ranking of the Node candidates for scheduling.',
        )}
      </Content>
      <Content className="text-muted" component={ContentVariants.p}>
        {t('Rules with "Preferred" condition will stack with an "AND" relation between them.')}
      </Content>
      <Content className="text-muted" component={ContentVariants.p}>
        {t('Rules with "Required" condition will stack with an "OR" relation between them.')}
      </Content>
    </>
  );
};
export default AffinityDescriptionText;
