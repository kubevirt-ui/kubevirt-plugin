import { CONSOLE_PASTE_EVENT } from './constants';

export const isConnectionEncrypted = () => window.location.protocol === 'https:';

export const clipboardCopyFunc = (
  _: React.ClipboardEvent<HTMLDivElement>,
  text?: React.ReactNode,
) => {
  const textString = text?.toString();
  navigator.clipboard.writeText(textString);
  document.dispatchEvent(
    new CustomEvent(CONSOLE_PASTE_EVENT, {
      detail: textString,
    }),
  );
};

export const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));
