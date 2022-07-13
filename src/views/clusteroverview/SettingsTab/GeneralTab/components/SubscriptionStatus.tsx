import * as React from 'react';

import { SubscriptionKind, SubscriptionState } from '../../../utils/types';

import SubscriptionStateAtLatest from './SubscriptionStates/SubscriptionStateAtLatest';
import SubscriptionStateDefault from './SubscriptionStates/SubscriptionStateDefault';
import SubscriptionStateUpgradeAvailable from './SubscriptionStates/SubscriptionStateUpgradeAvailable';
import SubscriptionStateUpgradePending from './SubscriptionStates/SubscriptionStateUpgradePending';

type SubscriptionStatusType = {
  subscription: SubscriptionKind;
  operatorLink: string;
};

const SubscriptionStatus: React.FC<SubscriptionStatusType> = ({ subscription, operatorLink }) => {
  const Component = {
    [SubscriptionState.SubscriptionStateUpgradeAvailable]: (
      <SubscriptionStateUpgradeAvailable operatorLink={operatorLink} />
    ),
    [SubscriptionState.SubscriptionStateUpgradePending]: (
      <SubscriptionStateUpgradePending subscription={subscription} operatorLink={operatorLink} />
    ),
    [SubscriptionState.SubscriptionStateAtLatest]: <SubscriptionStateAtLatest />,
    default: <SubscriptionStateDefault subscription={subscription} />,
  };

  return Component[subscription?.status?.state || 'default'];
};

export default SubscriptionStatus;
