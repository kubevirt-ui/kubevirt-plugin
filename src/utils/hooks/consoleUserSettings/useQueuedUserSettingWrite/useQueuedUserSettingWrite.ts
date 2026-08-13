import { useState } from 'react';

import {
  createQueuedUserSettingWrite,
  type QueuedUserSettingWrite,
} from './queuedUserSettingWrite';

const useQueuedUserSettingWrite = (): QueuedUserSettingWrite => {
  const [writer] = useState(() => createQueuedUserSettingWrite());
  return writer;
};

export default useQueuedUserSettingWrite;
