import { useMemo } from 'react';

import type { QueuedUserSettingWrite } from './queuedUserSettingWrite';
import { createQueuedUserSettingWrite } from './queuedUserSettingWrite';

const useQueuedUserSettingWrite = (): QueuedUserSettingWrite => {
  return useMemo(() => createQueuedUserSettingWrite(), []);
};

export default useQueuedUserSettingWrite;
