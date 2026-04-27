import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { GreenCheckCircleIcon } from '@openshift-console/dynamic-plugin-sdk';

const SubscriptionStateAtLatest: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <span>
      <GreenCheckCircleIcon /> {t('Up to date')}
    </span>
  );
};

export default SubscriptionStateAtLatest;
