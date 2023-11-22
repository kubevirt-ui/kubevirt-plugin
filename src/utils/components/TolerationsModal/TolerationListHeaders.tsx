import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { GridItem, Text, TextVariants } from '@patternfly/react-core';

const TolerationListHeaders: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <GridItem span={4}>
        <Text component={TextVariants.h4}>{t('Taint key')}</Text>
      </GridItem>
      <GridItem span={4}>
        <Text component={TextVariants.h4}>{t('Value')}</Text>
      </GridItem>
      <GridItem span={4}>
        <Text component={TextVariants.h4}>{t('Effect')}</Text>
      </GridItem>
    </>
  );
};

export default TolerationListHeaders;
