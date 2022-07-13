import * as React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { InProgressIcon } from '@patternfly/react-icons';

import BlueArrowCircleUpIcon from '../../../../utils/Components/BlueArrowCircleUpIcon';
import { SubscriptionKind } from '../../../../utils/types';
import { upgradeRequiresApproval } from '../utils/utils';

type SubscriptionStateUpgradePendingProps = {
  subscription: SubscriptionKind;
  operatorLink: string;
};

const SubscriptionStateUpgradePending: React.FC<SubscriptionStateUpgradePendingProps> = ({
  subscription,
  operatorLink,
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
