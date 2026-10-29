import type { FC } from 'react';
import { useShallow } from 'zustand/react/shallow';

import ExportUploadWatcherEntry from '@kubevirt-utils/components/ExportModal/components/ExportUploadWatcherEntry';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import UploadProgressToastSliceListener from '../../InFlightToastSliceListener';
import { useInFlightToastStore } from '../../inFlightToastStore';
import { type ExportDiskContext } from './types/types';

const ExportDiskProgressProvider: FC = () => {
  const activeExports = useInFlightToastStore(
    useShallow((state) =>
      Object.values(state.exportDisk.data).reduce<ExportDiskContext[]>((acc, entry) => {
        if (!isEmpty(entry.context)) {
          acc.push(entry.context as ExportDiskContext);
        }

        return acc;
      }, []),
    ),
  );

  return (
    <>
      <UploadProgressToastSliceListener storeSlice="exportDisk" />
      {activeExports?.map((upload) => (
        <ExportUploadWatcherEntry
          key={`${upload.cluster}/${upload.namespace}/${upload.pvcName}`}
          upload={upload}
        />
      ))}
    </>
  );
};

export default ExportDiskProgressProvider;
