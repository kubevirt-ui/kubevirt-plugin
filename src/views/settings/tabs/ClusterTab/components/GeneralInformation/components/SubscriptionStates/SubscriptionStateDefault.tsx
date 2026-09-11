import { type FC } from 'react';
import classNames from 'classnames';
import { type SubscriptionKind } from 'src/views/clusteroverview/utils/types';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
