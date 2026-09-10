import { useRef } from 'react';

import type { QueuedUserSettingWrite } from './queuedUserSettingWrite';
import { createQueuedUserSettingWrite } from './queuedUserSettingWrite';

const useQueuedUserSettingWrite = (): QueuedUserSettingWrite => {
  const writerRef = useRef(createQueuedUserSettingWrite());
  return writerRef.current;
};

export default useQueuedUserSettingWrite;
