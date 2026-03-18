import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const VirtualMachineTemplateSupport: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {t('Supported operating systems are labeled below. ')}
      <ExternalLink href={documentationURL.SUPPORT_URL}>
        {t('Learn more about Red Hat support')}
      </ExternalLink>
    </>
  );
};

export default VirtualMachineTemplateSupport;
