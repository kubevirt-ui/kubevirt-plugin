type SendKeyActions = {
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
};

type MenuItem = { onClick: () => void; text: string };

export const getMainMenuItems = (actions: SendKeyActions, closeMenu: () => void): MenuItem[] => [
  {
    onClick: (): void => {
      actions.sendCtrlAltDel?.();
      closeMenu();
    },
    text: 'Ctrl + Alt + Delete',
  },
  {
    onClick: (): void => {
      actions.sendCtrlAlt1?.();
      closeMenu();
    },
    text: 'Ctrl + Alt + 1',
  },
  {
    onClick: (): void => {
      actions.sendCtrlAlt2?.();
      closeMenu();
    },
    text: 'Ctrl + Alt + 2',
  },
];

export const getFunctionKeyItems = (actions: SendKeyActions): MenuItem[] => [
  { onClick: () => actions.sendF1?.(), text: 'F1' },
  { onClick: () => actions.sendF2?.(), text: 'F2' },
  { onClick: () => actions.sendF3?.(), text: 'F3' },
  { onClick: () => actions.sendF4?.(), text: 'F4' },
  { onClick: () => actions.sendF5?.(), text: 'F5' },
  { onClick: () => actions.sendF6?.(), text: 'F6' },
  { onClick: () => actions.sendF7?.(), text: 'F7' },
  { onClick: () => actions.sendF8?.(), text: 'F8' },
  { onClick: () => actions.sendF9?.(), text: 'F9' },
  { onClick: () => actions.sendF10?.(), text: 'F10' },
  { onClick: () => actions.sendF11?.(), text: 'F11' },
  { onClick: () => actions.sendF12?.(), text: 'F12' },
];
