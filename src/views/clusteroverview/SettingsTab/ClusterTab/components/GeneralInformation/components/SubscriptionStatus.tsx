import * as React from 'react';

import { SubscriptionKind, SubscriptionState } from '../../../../../utils/types';

import SubscriptionStateAtLatest from './SubscriptionStates/SubscriptionStateAtLatest';
import SubscriptionStateDefault from './SubscriptionStates/SubscriptionStateDefault';
import SubscriptionStateUpgradeAvailable from './SubscriptionStates/SubscriptionStateUpgradeAvailable';
import SubscriptionStateUpgradePending from './SubscriptionStates/SubscriptionStateUpgradePending';

type SubscriptionStatusType = {
  operatorLink: string;
  subscription: SubscriptionKind;
};

const SubscriptionStatus: React.FC<SubscriptionStatusType> = ({ operatorLink, subscription }) => {
  const Component = {
    default: <SubscriptionStateDefault subscription={subscription} />,
    [SubscriptionState.SubscriptionStateAtLatest]: <SubscriptionStateAtLatest />,
    [SubscriptionState.SubscriptionStateUpgradeAvailable]: (
      <SubscriptionStateUpgradeAvailable operatorLink={operatorLink} />
    ),
    [SubscriptionState.SubscriptionStateUpgradePending]: (
      <SubscriptionStateUpgradePending operatorLink={operatorLink} subscription={subscription} />
    ),
  };

  return Component[subscription?.status?.state || 'default'];
};

export default SubscriptionStatus;
