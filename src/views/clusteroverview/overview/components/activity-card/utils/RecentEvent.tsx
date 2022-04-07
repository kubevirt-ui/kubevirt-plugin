import * as React from 'react';

import { EventModel } from '@kubevirt-ui/kubevirt-api/console';
import { FirehoseResult, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { EventKind } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { RecentEventsBody } from '@openshift-console/dynamic-plugin-sdk-internal';

import { VIEW_EVENTS_PATH } from './constants';
import { eventTypes } from './utils';

const RecentEvent: React.FC = () => {
  const [events, loaded, loadError] = useK8sWatchResource<EventKind[]>({
    isList: true,
    kind: EventModel.kind,
    namespaced: false,
  });

  const filteredEvents = events?.filter((e) => eventTypes.includes(e.involvedObject.kind)) || [];
  const wrappedFilteredEvents: FirehoseResult<EventKind[]> = {
    loaded,
    loadError,
    data: filteredEvents,
  };

  return <RecentEventsBody events={wrappedFilteredEvents} moreLink={VIEW_EVENTS_PATH} />;
};

export default RecentEvent;
