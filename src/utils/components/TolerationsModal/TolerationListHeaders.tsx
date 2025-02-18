import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants, GridItem } from '@patternfly/react-core';

const TolerationListHeaders: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <GridItem span={4}>
        <Content component={ContentVariants.h4}>{t('Taint key')}</Content>
      </GridItem>
      <GridItem span={4}>
        <Content component={ContentVariants.h4}>{t('Value')}</Content>
      </GridItem>
      <GridItem span={4}>
        <Content component={ContentVariants.h4}>{t('Effect')}</Content>
      </GridItem>
    </>
  );
};

export default TolerationListHeaders;
