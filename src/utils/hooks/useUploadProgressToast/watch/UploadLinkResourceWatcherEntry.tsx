import { type FC, useEffect, useRef } from 'react';

import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import type { UploadLinkedResource } from '../types';

import {
  isUploadLinkedResourceGone,
  notifyDeletedUploadLinkedResource,
} from './notifyDeletedUploadLinkedResource';

type UploadLinkResourceWatcherEntryProps = {
  resource: UploadLinkedResource;
};

const UploadLinkResourceWatcherEntry: FC<UploadLinkResourceWatcherEntryProps> = ({ resource }) => {
  const wasObservedAliveRef = useRef(false);
  const [watchedResource, loaded, watchError] = useKubevirtWatchResource<K8sResourceCommon>({
    cluster: resource.cluster,
    groupVersionKind: resource.groupVersionKind,
    name: resource.name,
    namespace: resource.namespace,
  });

  useEffect(() => {
    if (watchedResource && !watchedResource.metadata?.deletionTimestamp) {
      wasObservedAliveRef.current = true;
    }

    if (
      isUploadLinkedResourceGone(watchedResource, loaded, watchError, wasObservedAliveRef.current)
    ) {
      notifyDeletedUploadLinkedResource(resource);
    }
  }, [loaded, resource, watchedResource, watchError]);

  return null;
};

export default UploadLinkResourceWatcherEntry;
