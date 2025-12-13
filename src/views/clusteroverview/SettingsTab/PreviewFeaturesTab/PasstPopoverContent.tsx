import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import LightspeedSimplePopoverContent from '@lightspeed/components/LightspeedSimplePopoverContent';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Content, ContentVariants } from '@patternfly/react-core';

type PasstPopoverContentProps = {
  hide: () => void;
};

const PasstPopoverContent: FC<PasstPopoverContentProps> = ({ hide }) => {
  const { t } = useKubevirtTranslation();
  return (
    <LightspeedSimplePopoverContent
      content={
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
      }
      hide={hide}
      promptType={OLSPromptType.ENABLE_PASST_BINDING}
    />
  );
};

export default PasstPopoverContent;
