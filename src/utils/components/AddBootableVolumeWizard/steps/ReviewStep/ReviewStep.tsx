import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

const ReviewStep: FC = () => {
  const { t } = useKubevirtTranslation();

  // placeholder - will be implemented in further prs
  return <Content component={ContentVariants.p}>{t('Review step')}</Content>;
};

export default ReviewStep;
