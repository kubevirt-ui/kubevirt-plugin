import React from 'react';

import { Node } from '@patternfly/react-topology';

import KnativeRevisionListViewNode from '../../components/knative/KnativeRevisionListViewNode';
import KnativeServiceListViewNode from '../../components/knative/KnativeServiceListViewNode';
import { NoStatusListViewNode } from '../../components/knative/NoStatusListViewNode';
import SinkURIListViewNode from '../../components/knative/SinkURIListViewNode';

import {
  TYPE_EVENT_PUB_SUB,
  TYPE_EVENT_PUB_SUB_LINK,
  TYPE_EVENT_SINK_LINK,
  TYPE_EVENT_SOURCE,
  TYPE_EVENT_SOURCE_KAFKA,
  TYPE_EVENT_SOURCE_LINK,
  TYPE_KNATIVE_REVISION,
  TYPE_KNATIVE_SERVICE,
  TYPE_SINK_URI,
} from './knative-const';

export const knativeListViewNodeComponentFactory = (
  type,
):
  | React.ComponentType<{
      item: Node;
      selectedIds: string[];
      onSelect: (ids: string[]) => void;
    }>
  | undefined => {
  switch (type) {
    case TYPE_KNATIVE_SERVICE:
      return KnativeServiceListViewNode;
    case TYPE_KNATIVE_REVISION:
      return KnativeRevisionListViewNode;
    case TYPE_SINK_URI:
      return SinkURIListViewNode;
    case TYPE_EVENT_PUB_SUB_LINK:
    case TYPE_EVENT_SOURCE:
    case TYPE_EVENT_SOURCE_LINK:
    case TYPE_EVENT_SINK_LINK:
    case TYPE_EVENT_PUB_SUB:
    case TYPE_EVENT_SOURCE_KAFKA:
      return NoStatusListViewNode;
    default:
      return null;
  }
};
