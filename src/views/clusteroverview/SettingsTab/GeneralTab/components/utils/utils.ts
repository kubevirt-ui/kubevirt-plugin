import { SubscriptionKind, SubscriptionState } from '../../../../utils/types';

const REQUIRES_APPROVAL = 'RequiresApproval';

export const upgradeRequiresApproval = (subscription: SubscriptionKind): boolean =>
  subscription?.status?.state === SubscriptionState.SubscriptionStateUpgradePending &&
  (subscription?.status?.conditions ?? []).filter(
    ({ status, reason }) => status === 'True' && reason === REQUIRES_APPROVAL,
  ).length > 0;
