import React, { type FC } from 'react';

import ExportUploadWatcherEntry from './components/ExportUploadWatcherEntry';
import { useExportUploadStore } from './exportUploadStore';

const ExportUploadToastWatcher: FC = () => {
  const uploads = useExportUploadStore((state) => state.uploads);

  return (
    <>
      {Object.values(uploads).map((upload) => (
        <ExportUploadWatcherEntry
          key={`${upload.cluster}/${upload.namespace}/${upload.pvcName}`}
          upload={upload}
        />
      ))}
    </>
  );
};

export default ExportUploadToastWatcher;
