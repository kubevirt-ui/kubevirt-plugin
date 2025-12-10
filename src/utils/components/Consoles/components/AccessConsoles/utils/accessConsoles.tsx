import { Dispatch, SetStateAction } from 'react';
import { TFunction } from 'react-i18next';

import { KeyboardLayout, keyMaps } from '@kubevirt-ui-ext/vnc-keymaps';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';

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
  sendPaste?: (params?: PasteParams) => Promise<void>;
};

export type PasteParams = {
  createModal?: (modal: ModalComponent) => void;
  selectedKeyboard?: KeyboardLayout;
  shouldFocusOnConsole?: boolean;
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

export const VNC_FAVORITE_KEYMAPS_KEY = 'VNC_FAVORITE_KEYMAPS';
export const EN_US: KeyboardLayout = 'en-us';
export const useFavoriteKeymaps = (): {
  defaultKeyboard: KeyboardLayout;
  favoriteKeymaps: KeyboardLayout[];
  updateFavorite: (value: KeyboardLayout) => void;
} => {
  const [savedFavoriteKeymaps, setLocalStorageValue, removeItem] =
    useLocalStorage(VNC_FAVORITE_KEYMAPS_KEY);
  const knownKeymaps = new Set(Object.keys(keyMaps));
  const filteredFavoriteKeymaps: KeyboardLayout[] = (
    Array.isArray(savedFavoriteKeymaps) ? savedFavoriteKeymaps : []
  ).filter((entry) => knownKeymaps.has(entry));
  return {
    defaultKeyboard: filteredFavoriteKeymaps?.[0] ?? EN_US,
    favoriteKeymaps: filteredFavoriteKeymaps,
    updateFavorite: (value: KeyboardLayout) => {
      if (!filteredFavoriteKeymaps.includes(value)) {
        // put the new value first - main use case: add/remove EN_US on top
        // of existing favorites to change the defaults
        setLocalStorageValue([value, ...filteredFavoriteKeymaps]);
        return;
      }

      if (filteredFavoriteKeymaps.length === 1) {
        removeItem();
        return;
      }

      setLocalStorageValue(filteredFavoriteKeymaps.filter((keymap) => keymap !== value));
    },
  };
};
