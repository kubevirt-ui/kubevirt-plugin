import { type SubscriptionKind, SubscriptionState } from '@kubevirt-utils/types/olm';

const REQUIRES_APPROVAL = 'RequiresApproval';

export const upgradeRequiresApproval = (subscription: SubscriptionKind): boolean =>
  subscription?.status?.state === SubscriptionState.SubscriptionStateUpgradePending &&
  (subscription?.status?.conditions ?? []).some(
    ({ reason, status }) => status === 'True' && reason === REQUIRES_APPROVAL,
  );
