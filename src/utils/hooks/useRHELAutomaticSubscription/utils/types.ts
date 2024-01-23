export type RHELAutomaticSubscriptionData = {
  activationKey: string;
  organizationID: string;
};

export type RHELAutomaticSubscriptionFormProps = {
  canEdit: boolean;
  loaded: boolean;
  loadError: Error;
  loading: boolean;
  subscriptionData: RHELAutomaticSubscriptionData;
  updateSubscription: (activationKey: string, organizationID: string) => void;
};
