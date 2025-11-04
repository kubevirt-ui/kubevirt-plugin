import { Dispatch, SetStateAction } from 'react';
import { TFunction } from 'react-i18next';

import {
  ConsoleState,
  DESKTOP_VIEWER_CONSOLE_TYPE,
  SERIAL_CONSOLE_TYPE,
  VNC_CONSOLE_TYPE,
} from '../../utils/ConsoleConsts';
import { ConsoleType } from '../../utils/types';

export type AccessConsolesActions = {
  connect?: () => void;
  disconnect?: () => void;
  sendCtrlAlt1?: () => void;
  sendCtrlAlt2?: () => void;
  sendCtrlAltDel?: () => void;
  sendF1?: () => void;
  sendF10?: () => void;
  sendF11?: () => void;
  sendF12?: () => void;
  sendF2?: () => void;
  sendF3?: () => void;
  sendF4?: () => void;
  sendF5?: () => void;
  sendF6?: () => void;
  sendF7?: () => void;
  sendF8?: () => void;
  sendF9?: () => void;
  sendPaste?: (shouldFocusOnConsole?: boolean) => Promise<void>;
};

export type AccessConsolesProps = {
  actions: AccessConsolesActions;
  isWindowsVM: boolean;
  setType: Dispatch<SetStateAction<ConsoleType>>;
  state: ConsoleState;
  type: ConsoleType;
};

export const typeMap = (isWindowsVM: boolean, t: TFunction): { [key in ConsoleType]: string } => ({
  ...(isWindowsVM && { [DESKTOP_VIEWER_CONSOLE_TYPE]: t('Desktop viewer') }),
  [SERIAL_CONSOLE_TYPE]: t('Serial console'),
  [VNC_CONSOLE_TYPE]: t('VNC console'),
});
