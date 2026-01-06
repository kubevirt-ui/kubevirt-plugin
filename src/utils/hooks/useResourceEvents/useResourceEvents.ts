import { useEffect, useRef, useState } from 'react';
import { concat, keyBy, omit } from 'lodash';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EventMessage, EventType } from '@kubevirt-utils/hooks/useResourceEvents/utils/types';
import { getFieldSelector, watchURL } from '@kubevirt-utils/hooks/useResourceEvents/utils/utils';
import { EventModel } from '@kubevirt-utils/models';
import { getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { EventKind } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { WSFactory } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/ws-factory';
import { sortEvents } from '@stolostron/multicluster-sdk/lib/internal/FleetResourceEventStream/utils';

import { EVENTS_FLUSH_INTERVAL, EVENTS_MAX_MESSAGES } from './utils/constants';

type UseResourceEvents = (
  obj: K8sResourceCommon,
  maxEvents?: number,
  keepSocketOpen?: boolean,
) => {
  error: Error;
  events: EventKind[];
  loaded: boolean;
};

const useResourceEvents: UseResourceEvents = (
  obj,
  maxEvents = EVENTS_MAX_MESSAGES,
  keepSocketOpen = true,
) => {
  const { t } = useKubevirtTranslation();
  const [sortedEvents, setSortedEvents] = useState<EventKind[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  const namespace = getNamespace(obj);
  const ws = useRef(null);
  const fieldSelector = getFieldSelector(obj);

  // Handle websocket setup and teardown when dependent props change
  useEffect(() => {
    ws.current?.destroy();
    setSortedEvents([]);

    const webSocketID = `${namespace || 'all'}-sysevents`;
    const watchURLOptions = {
      ...(namespace ? { ns: namespace } : {}),
      ...(fieldSelector
        ? {
            queryParams: {
              fieldSelector: encodeURIComponent(fieldSelector),
            },
          }
        : {}),
    };
    const path = watchURL(EventModel, watchURLOptions);
    const webSocketOptions = {
      bufferFlushInterval: EVENTS_FLUSH_INTERVAL,
      bufferMax: maxEvents,
      host: 'auto',
      jsonParse: true,
      path,
      reconnect: true,
      subprotocols: [],
    };

    ws.current = new WSFactory(webSocketID, webSocketOptions)
      .onbulkmessage((messages: EventMessage[]) => {
        // Make one update to state per batch of events.
        setSortedEvents((currentSortedEvents): EventKind[] => {
          const topEvents = currentSortedEvents.slice(0, maxEvents - 1);
          const batch: Record<string, EventKind> = messages.reduce(
            (acc, { object: event, type: eventType }) => {
              const { count: messageCount } = event;
              const uid = getUID(event);
              switch (eventType) {
                case EventType.Added:
                case EventType.Modified:
                  if (acc[uid] && acc[uid].count > messageCount) {
                    // We already have a more recent version of this message stored, so skip this one
                    return acc;
                  }
                  return { ...acc, [uid]: event };
                case EventType.Deleted:
                  return omit(acc, uid);
                default:
                  kubevirtConsole.error(`Unhandled event: ${eventType}`);
                  return acc;
              }
            },
            keyBy(topEvents, 'metadata.uid'),
          );
          return !isEmpty(batch) ? sortEvents(concat(Object.values(batch))) : [];
        });

        setLoaded(true);
        if (!keepSocketOpen) ws.current?.destroy();
      })
      .onopen(() => {
        setError(null);
        setLoaded(false);
      })
      .onclose((event) => {
        if (event?.wasClean === false) {
          const errorMessage = t('Connection did not close cleanly.');
          setError(new Error(event.reason || errorMessage));
          kubevirtConsole.error(errorMessage);
        }
        setLoaded(true);
      })
      .onerror(() => {
        const errorMessage = t('An error occurred.');
        setError(new Error(errorMessage));
        kubevirtConsole.error(errorMessage);

        setLoaded(true);
        ws.current?.destroy();
      });

    return () => {
      ws.current?.destroy();
    };
  }, [namespace, fieldSelector, t, maxEvents, keepSocketOpen]);

  return { error, events: sortedEvents, loaded };
};

export default useResourceEvents;
