import { useEffect, useRef, useState } from 'react';
import concat from 'lodash/concat';
import keyBy from 'lodash/keyBy';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type EventMessage } from '@kubevirt-utils/hooks/useResourceEvents/utils/types';
import { getFieldSelector, watchURL } from '@kubevirt-utils/hooks/useResourceEvents/utils/utils';
import { EventModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { type EventKind } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { WSFactory } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/ws-factory';
import { sortEvents } from '@stolostron/multicluster-sdk/lib/internal/FleetResourceEventStream/utils';

import { EVENTS_FLUSH_INTERVAL, EVENTS_MAX_MESSAGES } from './utils/constants';
import processEventMessage from './utils/processEventMessage';

type UseResourceEvents = (
  obj: K8sResourceCommon,
  maxEvents?: number,
  keepSocketOpen?: boolean,
  timeout?: number,
) => {
  error: Error;
  events: EventKind[];
  loaded: boolean;
};

const useResourceEvents: UseResourceEvents = (
  obj,
  maxEvents = EVENTS_MAX_MESSAGES,
  keepSocketOpen = true,
  timeout,
) => {
  const { t } = useKubevirtTranslation();
  const [sortedEvents, setSortedEvents] = useState<EventKind[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  const namespace = getNamespace(obj);
  const wsRef = useRef(null);
  const timeoutIdRef = useRef<null | ReturnType<typeof setTimeout>>(null);
  const fieldSelector = getFieldSelector(obj);

  // Handle websocket setup and teardown when dependent props change
  useEffect(() => {
    wsRef.current?.destroy();
    setSortedEvents([]);

    const webSocketID = `${namespace ?? 'all'}-sysevents`;
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

    wsRef.current = new WSFactory(webSocketID, webSocketOptions)
      .onbulkmessage((messages: EventMessage[]) => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }

        // Make one update to state per batch of events.
        setSortedEvents((currentSortedEvents): EventKind[] => {
          const topEvents = currentSortedEvents.slice(0, maxEvents - 1);
          const batch = messages.reduce<Record<string, EventKind>>(
            processEventMessage,
            keyBy(topEvents, 'metadata.uid'),
          );
          return !isEmpty(batch) ? sortEvents(concat(Object.values(batch))) : [];
        });

        setLoaded(true);
        if (!keepSocketOpen) wsRef.current?.destroy();
      })
      .onopen(() => {
        setError(null);
        setLoaded(false);

        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }

        if (timeout) {
          timeoutIdRef.current = setTimeout(() => {
            setLoaded(true);
            wsRef.current?.destroy();
            timeoutIdRef.current = null;
          }, timeout);
        }
      })
      .onclose((event) => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }

        if (event?.wasClean === false) {
          const errorMessage = t('Connection did not close cleanly.');
          setError(new Error(event.reason || errorMessage));
          kubevirtConsole.error(errorMessage);
        }
        setLoaded(true);
      })
      .onerror(() => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }

        const errorMessage = t('An error occurred.');
        setError(new Error(errorMessage));
        kubevirtConsole.error(errorMessage);

        setLoaded(true);
        wsRef.current?.destroy();
      });

    return (): void => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      wsRef.current?.destroy();
    };
  }, [namespace, fieldSelector, t, maxEvents, keepSocketOpen, timeout]);

  return { error, events: sortedEvents, loaded };
};

export default useResourceEvents;
