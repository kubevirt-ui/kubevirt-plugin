import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const QuotasLearnMoreLink: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExternalLink href={documentationURL.AAQ_OPERATOR}>
      {t('Learn more about managing VM quotas with AAQ')}
    </ExternalLink>
  );
};

export default QuotasLearnMoreLink;
