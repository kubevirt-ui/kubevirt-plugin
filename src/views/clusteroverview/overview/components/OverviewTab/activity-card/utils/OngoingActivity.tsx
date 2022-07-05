import * as React from 'react';

import { OngoingActivityBody } from '@openshift-console/dynamic-plugin-sdk-internal';

import useDashboardK8sResources from '../hooks/useDashboardK8sResources';
import useDashboardPrometheusActivities from '../hooks/useDashboardPrometheusActivities';

const OngoingActivity: React.FC = () => {
  const { k8sResourceActivities, k8sResourcesLoaded } = useDashboardK8sResources();
  const { prometheusActivities, prometheusQueriesLoaded } = useDashboardPrometheusActivities();

  return (
    k8sResourcesLoaded &&
    prometheusQueriesLoaded && (
      <OngoingActivityBody
        loaded={k8sResourcesLoaded && prometheusQueriesLoaded}
        // TODO Fix typing
        // skipcq: JS-0349
        resourceActivities={k8sResourceActivities as any}
        prometheusActivities={prometheusActivities}
      />
    )
  );
};

export default OngoingActivity;
