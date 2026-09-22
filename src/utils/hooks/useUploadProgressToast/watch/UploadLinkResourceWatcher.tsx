import { type FC } from 'react';

import { useUploadProgressStore } from '../uploadProgressStore';

import {
  collectWatchableUploadResources,
  getUploadLinkedResourceWatchKey,
} from './collectWatchableUploadResources';
import UploadLinkResourceWatcherEntry from './UploadLinkResourceWatcherEntry';

const UploadLinkResourceWatcher: FC = () => {
  const resources = useUploadProgressStore((state) =>
    collectWatchableUploadResources(state.uploads),
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
