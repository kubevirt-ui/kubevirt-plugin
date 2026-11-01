import { type FC } from 'react';

import { useInFlightToastStore } from '@kubevirt-utils/hooks/useInFlightToast/inFlightToastStore';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import WatchedResourceToastListenerEntry from '../components/WatchedResourceToastListenerEntry';

const WatchedResourcesToastProvider: FC = () => {
  const watchedResourcesData = useInFlightToastStore((state) => state.watchedResources.data);

  if (isEmpty(watchedResourcesData)) {
    return null;
  }

  return (
    <>
      {Object.entries(watchedResourcesData).map(([id, watchedResource]) => (
        <WatchedResourceToastListenerEntry
          key={id}
          watchedResourceToast={{ ...watchedResource, id }}
        />
      ))}
    </>
  );
};

export default WatchedResourcesToastProvider;
