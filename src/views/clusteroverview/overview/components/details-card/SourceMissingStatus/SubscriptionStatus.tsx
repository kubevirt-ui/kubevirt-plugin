import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  GreenCheckCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon } from '@patternfly/react-icons';

import { SubscriptionKind, SubscriptionState } from '../utils/types';

import UpgradeApprovalLink from './UpgradeApprovalLink';

const upgradeRequiresApproval = (subscription: SubscriptionKind): boolean =>
  subscription?.status?.state === SubscriptionState.SubscriptionStateUpgradePending &&
  (subscription?.status?.conditions ?? []).filter(
    ({ status, reason }) => status === 'True' && reason === 'RequiresApproval',
  ).length > 0;

const SubscriptionStatus: React.FC<{ subscription: SubscriptionKind }> = ({ subscription }) => {
  const { t } = useKubevirtTranslation();
  switch (subscription?.status?.state) {
    case SubscriptionState.SubscriptionStateUpgradeAvailable:
      return (
        <span>
          <YellowExclamationTriangleIcon /> {t('Upgrade available')}
        </span>
      );
    case SubscriptionState.SubscriptionStateUpgradePending:
      return upgradeRequiresApproval(subscription) && subscription?.status?.installPlanRef ? (
        <UpgradeApprovalLink subscription={subscription} />
      ) : (
        <span>
          <InProgressIcon className="text-primary" /> {t('Upgrading')}
        </span>
      );
    case SubscriptionState.SubscriptionStateAtLatest:
      return (
        <span>
          <GreenCheckCircleIcon /> {t('Up to date')}
        </span>
      );
    default:
      return (
        <span className={isEmpty(subscription?.status?.state) ? 'text-muted' : ''}>
          {subscription?.status?.state || t('Unknown failure')}
        </span>
      );
  }
};

export default SubscriptionStatus;
