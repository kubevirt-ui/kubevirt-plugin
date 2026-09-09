import React, { type FC } from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type SubscriptionKind } from '@kubevirt-utils/types/olm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

type SubscriptionStateDefaultProps = {
  subscription: SubscriptionKind;
};

const SubscriptionStateDefault: FC<SubscriptionStateDefaultProps> = ({ subscription }) => {
  const { t } = useKubevirtTranslation();

  return (
    <span
      className={classNames({ 'pf-v6-u-text-color-subtle': isEmpty(subscription?.status?.state) })}
    >
      {subscription?.status?.state ?? t('Unknown failure')}
    </span>
  );
};

export default SubscriptionStateDefault;
