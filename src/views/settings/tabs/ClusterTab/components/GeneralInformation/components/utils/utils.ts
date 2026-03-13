import { SubscriptionKind, SubscriptionState } from '@overview/utils/types';

const REQUIRES_APPROVAL = 'RequiresApproval';

export const upgradeRequiresApproval = (subscription: SubscriptionKind): boolean =>
  subscription?.status?.state === SubscriptionState.SubscriptionStateUpgradePending &&
  (subscription?.status?.conditions ?? []).filter(
    ({ reason, status }) => status === 'True' && reason === REQUIRES_APPROVAL,
  ).length > 0;
