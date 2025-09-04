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
  sendPaste?: (consoleFocus?: boolean) => void;
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
