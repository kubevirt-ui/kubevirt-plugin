import { type FC } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useInFlightToastStore } from '../inFlightToastStore';

import {
  collectWatchableUploadResources,
  getUploadLinkedResourceWatchKey,
} from './collectWatchableUploadResources';
import UploadLinkResourceWatcherEntry from './UploadLinkResourceWatcherEntry';

const UploadLinkResourceWatcher: FC = () => {
  const resources = useInFlightToastStore(
    useShallow((state) => collectWatchableUploadResources(state.uploads.data)),
  );

  return (
    <>
      {resources.map((resource) => (
        <UploadLinkResourceWatcherEntry
          key={getUploadLinkedResourceWatchKey(resource)}
          resource={resource}
        />
      ))}
    </>
  );
};

export default UploadLinkResourceWatcher;
