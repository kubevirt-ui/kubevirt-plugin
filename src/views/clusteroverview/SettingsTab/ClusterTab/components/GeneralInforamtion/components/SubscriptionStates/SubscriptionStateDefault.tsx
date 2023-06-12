import React from 'react';
import cn from 'classnames';
import { SubscriptionKind } from 'src/views/clusteroverview/utils/types';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';

type SubscriptionStateDefaultProps = {
  subscription: SubscriptionKind;
};

const SubscriptionStateDefault: React.FC<SubscriptionStateDefaultProps> = ({ subscription }) => {
  const { t } = useKubevirtTranslation();

  return (
    <span className={cn({ 'text-muted': isEmpty(subscription?.status?.state) })}>
      {subscription?.status?.state || t('Unknown failure')}
    </span>
  );
};

export default SubscriptionStateDefault;
