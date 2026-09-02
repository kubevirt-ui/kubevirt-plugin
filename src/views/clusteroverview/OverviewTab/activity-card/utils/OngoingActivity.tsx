import React, { type FC } from 'react';

import { OngoingActivityBody } from '@openshift-console/dynamic-plugin-sdk-internal';

import useDashboardK8sResources from '../hooks/useDashboardK8sResources';
import useDashboardPrometheusActivities from '../hooks/useDashboardPrometheusActivities';

const OngoingActivity: FC = () => {
  const { k8sResourceActivities, k8sResourcesLoaded } = useDashboardK8sResources();
  const { prometheusActivities, prometheusQueriesLoaded } = useDashboardPrometheusActivities();

  return (
    k8sResourcesLoaded &&
    prometheusQueriesLoaded && (
      <OngoingActivityBody
        loaded={k8sResourcesLoaded && prometheusQueriesLoaded}
        // Fix typing
        prometheusActivities={prometheusActivities}
        resourceActivities={k8sResourceActivities as never}
      />
    )
  );
};

export default OngoingActivity;
