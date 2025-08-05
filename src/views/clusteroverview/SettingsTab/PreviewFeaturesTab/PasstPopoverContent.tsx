import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

const PasstPopoverContent: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <div>
      <Content component={ContentVariants.h6}>{t('Passt')}</Content>
      <Content component={ContentVariants.p}>
        {t(
          'Passt is an alternative to the L2 bridge binding used for primary layer 2 user-defined networks. It removes the need for elevated permissions and complex network setups.',
        )}
      </Content>
      <Content component={ContentVariants.p}>
        {t('Enable Passt to SSH your VirtualMachine using virtctl')}
      </Content>
    </div>
  );
};

export default PasstPopoverContent;
