import * as React from 'react';

import {
  DashboardsOverviewHealthURLSubsystem,
  DashboardsOverviewHealthURLSubsystem as DynamicDashboardsOverviewHealthURLSubsystem,
  FirehoseResource,
  FirehoseResult,
  ResolvedExtension,
  useK8sModels,
  useK8sWatchResource,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { SubsystemHealth } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/dashboard-types';
import { k8sBasePath } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/k8s';
import { HealthItem, useURLPoll } from '@openshift-console/dynamic-plugin-sdk-internal';

import URLHealthItemPopup from './URLHealthItemPopup';
import { asArray } from './utils';

type URLHealthItemProps = {
  subsystem:
    | DashboardsOverviewHealthURLSubsystem<any>['properties']
    | ResolvedExtension<DynamicDashboardsOverviewHealthURLSubsystem<any>>['properties'];
};

const URLHealthItem: React.FC<URLHealthItemProps> = ({ subsystem }) => {
  const k8sURL = `${k8sBasePath}/${subsystem?.url}`;
  const [response, error] = useURLPoll(k8sURL);

  const [models] = useK8sModels();
  const modelExists =
    subsystem?.additionalResource &&
    !!models?.[(subsystem?.additionalResource as FirehoseResource).kind];

  const resourceObj = modelExists ? (subsystem?.additionalResource as WatchK8sResource) : null;
  const [resource, resourceLoaded, resourceError] = useK8sWatchResource(resourceObj);
  const resourceFirehoseResults: FirehoseResult = {
    data: asArray(resource),
    loaded: resourceLoaded,
    loadError: resourceError,
  };

  const k8sResult = subsystem.additionalResource ? resourceFirehoseResults : null;
  const healthState = subsystem.healthHandler(response, error, k8sResult) as SubsystemHealth;

  return (
    <HealthItem
      title={subsystem.title}
      state={healthState.state}
      details={healthState.message}
      popupTitle={subsystem.popupTitle}
    >
      {subsystem?.popupComponent && <URLHealthItemPopup subsystem={subsystem} />}
    </HealthItem>
  );
};

export default URLHealthItem;
