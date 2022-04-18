import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';

const AffinityDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Text className="text-muted" component={TextVariants.p}>
        {t(
          'Set scheduling requirements and affect the ranking of the Node candidates for scheduling.',
        )}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t('Rules with "Preferred" condition will stack with an "AND" relation between them.')}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t('Rules with "Required" condition will stack with an "OR" relation between them.')}
      </Text>
    </>
  );
};
export default AffinityDescriptionText;
