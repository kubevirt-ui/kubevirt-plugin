import { type FC } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useUploadProgressStore } from '../uploadProgressStore';

import {
  collectWatchableUploadResources,
  getUploadLinkedResourceWatchKey,
} from './collectWatchableUploadResources';
import UploadLinkResourceWatcherEntry from './UploadLinkResourceWatcherEntry';

const UploadLinkResourceWatcher: FC = () => {
  const resources = useUploadProgressStore(
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
