import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { type UploadEntry } from '../types';

import { resolveToastUpload } from './resolveToastUpload';

const snapshot: UploadEntry = {
  contextLinks: [{ label: 'View storage', url: '/vms/test-vm/storage' }],
  fileName: 'image.iso',
  generation: 1,
  progress: 40,
  status: UPLOAD_PROGRESS_STATUS.CANCELED,
};

describe('resolveToastUpload', () => {
  it('should use the store entry when there is no snapshot', () => {
    const storeUpload = { ...snapshot, contextLinks: [] };

    expect(resolveToastUpload(undefined, storeUpload)).toBe(storeUpload);
  });

  it('should keep live links when the snapshot generation still matches the store', () => {
    const storeUpload = { ...snapshot, contextLinks: [] };

    expect(resolveToastUpload(snapshot, storeUpload)).toEqual({
      ...snapshot,
      contextLinks: [],
    });
  });

  it('should keep the snapshot when a retry replaced the store entry', () => {
    const storeUpload = {
      ...snapshot,
      contextLinks: [],
      generation: 2,
      status: UPLOAD_PROGRESS_STATUS.UPLOADING,
    };

    expect(resolveToastUpload(snapshot, storeUpload)).toBe(snapshot);
  });
});
