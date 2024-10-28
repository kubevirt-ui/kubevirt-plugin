import { Dispatch, SetStateAction } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RFBCreate } from '@novnc/novnc/core/rfb';

import {
  DESKTOP_VIEWER_CONSOLE_TYPE,
  SERIAL_CONSOLE_TYPE,
  VNC_CONSOLE_TYPE,
  WSFactoryExtends,
} from '../../utils/ConsoleConsts';

export type AccessConsolesProps = {
  isWindowsVM: boolean;
  rfb?: RFBCreate;
  serialSocket?: WSFactoryExtends;
  setType: Dispatch<SetStateAction<string>>;
  type: string;
};

export const typeMap = (isWindowsVM: boolean) => ({
  ...(isWindowsVM && { [DESKTOP_VIEWER_CONSOLE_TYPE]: t('Desktop viewer') }),
  [SERIAL_CONSOLE_TYPE]: t('Serial console'),
  [VNC_CONSOLE_TYPE]: t('VNC console'),
});
