import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export enum AutomaticSubscriptionTypeEnum {
  ENABLE_PREDICTIVE_ANALYTICS = 'predictiveAnalytics',
  MONITOR_AND_MANAGE_SUBSCRIPTIONS = 'monitorAndManageSubscriptions',
  NO_SUBSCRIPTION = 'noSubscription',
}

export type SubscriptionItem = {
  title: string;
  value: AutomaticSubscriptionTypeEnum;
};

export const selectItems: SubscriptionItem[] = [
  {
    title: t('No subscription'),
    value: AutomaticSubscriptionTypeEnum.NO_SUBSCRIPTION,
  },
  {
    title: t('Monitor and manage subscriptions'),
    value: AutomaticSubscriptionTypeEnum.MONITOR_AND_MANAGE_SUBSCRIPTIONS,
  },
  {
    title: t('Enable predictive analytics'),
    value: AutomaticSubscriptionTypeEnum.ENABLE_PREDICTIVE_ANALYTICS,
  },
];

export const getSubscriptionItem = (value: string): SubscriptionItem | undefined =>
  selectItems.find((item) => item.value === value);
