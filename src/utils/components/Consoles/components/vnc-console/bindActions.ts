import { type PasteParams } from '../AccessConsoles/utils/accessConsoles';
import {
  sendCtrlAlt1,
  sendCtrlAlt2,
  sendF1,
  sendF2,
  sendF3,
  sendF4,
  sendF5,
  sendF6,
  sendF7,
  sendF8,
  sendF9,
  sendF10,
  sendF11,
  sendF12,
  sendPasteCMD,
} from './actions';
import { type RFB } from './utils/VncConsoleTypes';

type BoundRfbActions = {
  sendCtrlAlt1: () => void;
  sendCtrlAlt2: () => void;
  sendCtrlAltDel: () => void;
  sendF1: () => void;
  sendF10: () => void;
  sendF11: () => void;
  sendF12: () => void;
  sendF2: () => void;
  sendF3: () => void;
  sendF4: () => void;
  sendF5: () => void;
  sendF6: () => void;
  sendF7: () => void;
  sendF8: () => void;
  sendF9: () => void;
  sendPaste: (params?: PasteParams) => Promise<void>;
};

export const bindRfbActions = (rfbInst: RFB): BoundRfbActions => ({
  sendCtrlAlt1: sendCtrlAlt1.bind(rfbInst),
  sendCtrlAlt2: sendCtrlAlt2.bind(rfbInst),
  sendCtrlAltDel: rfbInst.sendCtrlAltDel?.bind(rfbInst),
  sendF1: sendF1.bind(rfbInst),
  sendF10: sendF10.bind(rfbInst),
  sendF11: sendF11.bind(rfbInst),
  sendF12: sendF12.bind(rfbInst),
  sendF2: sendF2.bind(rfbInst),
  sendF3: sendF3.bind(rfbInst),
  sendF4: sendF4.bind(rfbInst),
  sendF5: sendF5.bind(rfbInst),
  sendF6: sendF6.bind(rfbInst),
  sendF7: sendF7.bind(rfbInst),
  sendF8: sendF8.bind(rfbInst),
  sendF9: sendF9.bind(rfbInst),
  sendPaste: sendPasteCMD.bind(rfbInst),
});
