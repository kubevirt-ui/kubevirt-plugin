import React, { type FC } from 'react';

import { EventModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { type EventKind } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { RecentEventsBody } from '@openshift-console/dynamic-plugin-sdk-internal';

import { VIEW_EVENTS_PATH } from './constants';
import { eventTypes } from './utils';

const RecentEvent: FC = () => {
  const result = useK8sWatchResource<EventKind[]>({
    isList: true,
    kind: EventModel.kind,
    namespaced: false,
  });
  const events = result[0];
  const loaded = result[1];
  const loadError: unknown = result[2];

  const filteredEvents = events?.filter((e) => eventTypes.includes(e.involvedObject.kind)) || [];

  return (
    <RecentEventsBody
      eventsData={filteredEvents}
      eventsLoaded={loaded}
      eventsLoadError={loadError}
      moreLink={VIEW_EVENTS_PATH}
    />
  );
};

export default RecentEvent;
