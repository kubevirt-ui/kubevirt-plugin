import React, { type FC } from 'react';

import BlueArrowCircleUpIcon from '@kubevirt-utils/components/HealthState/BlueArrowCircleUpIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type SubscriptionKind } from '@kubevirt-utils/types/olm';
import { InProgressIcon } from '@patternfly/react-icons';
import SettingsLink from '@settings/context/SettingsLink';

import { upgradeRequiresApproval } from '../utils/utils';

type SubscriptionStateUpgradePendingProps = {
  operatorLink: string;
  subscription: SubscriptionKind;
};

const SubscriptionStateUpgradePending: FC<SubscriptionStateUpgradePendingProps> = ({
  operatorLink,
  subscription,
}) => {
  const { t } = useKubevirtTranslation();

  const isApproved = upgradeRequiresApproval(subscription) && subscription?.status?.installPlanRef;

  return isApproved ? (
    <span className="co-icon-and-text">
      <SettingsLink showExternalIcon to={operatorLink}>
        <BlueArrowCircleUpIcon /> {t('Upgrade available')}
      </SettingsLink>
    </span>
  ) : (
    <span>
      <InProgressIcon className="text-primary" /> {t('Upgrading')}
    </span>
  );
};

export default SubscriptionStateUpgradePending;
