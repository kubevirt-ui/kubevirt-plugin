import { useEffect } from 'react';

import { useUploadProgressStore } from '../uploadProgressStore';
import { UPLOAD_PROGRESS_STATUS } from '../utils/constants';

const useUploadBeforeUnload = (): void => {
  const hasActiveUploads = useUploadProgressStore((state) =>
    Object.values(state.uploads).some((entry) => entry.status === UPLOAD_PROGRESS_STATUS.UPLOADING),
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
