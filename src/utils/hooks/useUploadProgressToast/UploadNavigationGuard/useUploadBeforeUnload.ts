import { useEffect } from 'react';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { useUploadProgressStore } from '../uploadProgressStore';

const useUploadBeforeUnload = (): void => {
  const hasActiveUploads = useUploadProgressStore((state) =>
    Object.values(state.uploads.data).some(
      (entry) =>
        entry.progressToastState?.status === UPLOAD_PROGRESS_STATUS.UPLOADING &&
        entry.progressToastState?.blockNavigation !== false,
    ),
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
