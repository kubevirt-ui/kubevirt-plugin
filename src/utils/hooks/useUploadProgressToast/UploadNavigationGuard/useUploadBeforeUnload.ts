import { useEffect } from 'react';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { useUploadProgressStore } from '../uploadProgressStore';

const useUploadBeforeUnload = (): void => {
  const hasActiveUploads = useUploadProgressStore((state) =>
    Object.values(state.uploads).some(
      (entry) =>
        entry.status === UPLOAD_PROGRESS_STATUS.UPLOADING && entry.blockNavigation !== false,
    ),
  );

  useEffect(() => {
    if (!hasActiveUploads) {
      return;
    }

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasActiveUploads]);
};

export default useUploadBeforeUnload;
