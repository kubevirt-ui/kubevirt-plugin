import { useRef } from 'react';

import { createQueuedUserSettingWrite, QueuedUserSettingWrite } from './queuedUserSettingWrite';

const useQueuedUserSettingWrite = (): QueuedUserSettingWrite => {
  const writerRef = useRef(createQueuedUserSettingWrite());
  return writerRef.current;
};

export default useQueuedUserSettingWrite;
