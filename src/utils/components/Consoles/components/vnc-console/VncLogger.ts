import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { DEBUG, INFO } from './utils/constants';
import { VncLogLevel } from './utils/VncConsoleTypes';

export type VncLoggerType = {
  log: (logLevel: VncLogLevel, ...args: unknown[]) => void;
};

const logger: VncLoggerType = {
  log: (logLevel, ...args) => {
    if (logLevel && [DEBUG, INFO].includes(logLevel)) {
      kubevirtConsole.log(...args);
    }
  },
};

export default logger;
