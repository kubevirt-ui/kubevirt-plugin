import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { VncLogLevel } from './utils/constants';

export type VncLoggerType = {
  log: (logLevel: VncLogLevel, ...args: any[]) => void;
};

const logger: VncLoggerType = {
  log: (logLevel, ...args) => {
    if (logLevel && ['debug', 'info'].includes(logLevel)) {
      kubevirtConsole.log(...args);
    }
  },
};

export default logger;
