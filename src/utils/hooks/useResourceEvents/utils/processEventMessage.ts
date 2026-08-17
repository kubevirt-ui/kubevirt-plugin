import omit from 'lodash/omit';

import { type EventMessage, EventType } from '@kubevirt-utils/hooks/useResourceEvents/utils/types';
import { getUID } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { type EventKind } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';

const processEventMessage = (
  acc: Record<string, EventKind>,
  { object: event, type: eventType }: EventMessage,
): Record<string, EventKind> => {
  const { count: messageCount } = event;
  const uid = getUID(event);
  switch (eventType) {
    case EventType.Added:
    case EventType.Modified:
      if (acc[uid] && acc[uid].count > messageCount) {
        return acc;
      }
      return { ...acc, [uid]: event };
    case EventType.Deleted:
      return omit(acc, uid) as Record<string, EventKind>;
    default:
      kubevirtConsole.error(`Unhandled event: ${String(eventType)}`);
      return acc;
  }
};

export default processEventMessage;
