import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { InProgressIcon } from '@patternfly/react-icons';

import BlueArrowCircleUpIcon from '../../../../../../utils/Components/BlueArrowCircleUpIcon';
import { SubscriptionKind } from '../../../../../../utils/types';
import { upgradeRequiresApproval } from '../utils/utils';

type SubscriptionStateUpgradePendingProps = {
  operatorLink: string;
  subscription: SubscriptionKind;
};

const SubscriptionStateUpgradePending: React.FC<SubscriptionStateUpgradePendingProps> = ({
  operatorLink,
  subscription,
}) => {
  const { t } = useKubevirtTranslation();

  const isApproved = upgradeRequiresApproval(subscription) && subscription?.status?.installPlanRef;

  return isApproved ? (
    <span className="co-icon-and-text">
      <Link to={operatorLink}>
        <BlueArrowCircleUpIcon /> {t('Upgrade available')}
      </Link>
    </span>
  ) : (
    <span>
      <InProgressIcon className="text-primary" /> {t('Upgrading')}
    </span>
  );
};

export default SubscriptionStateUpgradePending;
