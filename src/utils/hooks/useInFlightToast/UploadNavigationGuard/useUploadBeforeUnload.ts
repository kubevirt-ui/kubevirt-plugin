import { useEffect } from 'react';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { useInFlightToastStore } from '../inFlightToastStore';

const hasBlockingUpload = (
  data: Record<string, { progressToastState?: { blockNavigation?: boolean; status?: string } }>,
): boolean =>
  Object.values(data).some(
    (entry) =>
      entry.progressToastState?.status === UPLOAD_PROGRESS_STATUS.UPLOADING &&
      entry.progressToastState?.blockNavigation !== false,
  );

const useUploadBeforeUnload = (): void => {
  const hasActiveUploads = useInFlightToastStore((state) =>
    hasBlockingUpload({ ...state.uploads.data, ...state.exportDisk.data }),
  );

  useEffect(() => {
    if (!hasActiveUploads) {
      return;
    }

    const handler = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return (): void => window.removeEventListener('beforeunload', handler);
  }, [hasActiveUploads]);
};

export default useUploadBeforeUnload;
