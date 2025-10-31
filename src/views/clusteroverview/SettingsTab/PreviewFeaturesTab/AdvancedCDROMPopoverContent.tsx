import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

const AdvancedCDROMPopoverContent: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <div>
      <Content component={ContentVariants.h6}>{t('Advanced CD-ROM features')}</Content>
      <Content component={ContentVariants.p}>
        {t(
          'Enable advanced CD-ROM features including ejecting CD-ROM disks and adding empty CD-ROM drives.',
        )}
      </Content>
    </div>
  );
};

export default AdvancedCDROMPopoverContent;
