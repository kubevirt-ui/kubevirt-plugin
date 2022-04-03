export type XTermProps = {
  /** The number of columns to resize to */
  cols?: number;
  /** The number of rows to resize to */
  rows?: number;
  fontFamily?: string;
  fontSize?: number;
  /** terminall title has been changed. */
  onTitleChanged?: (title: string) => void;
  /** Data to be sent from terminall to backend; (data) => {} */
  onData?: (e: string) => void;
  /** A reference object to attach to the xterm */
  innerRef?: React.RefObject<any>;
};

export const onBeforeUnload = (event: any) => {
  event.preventDefault();
  event.returnValue = '';
  return '';
};

export const onFocusOut = () => {
  window.removeEventListener('beforeunload', onBeforeUnload);
};

export const onFocusIn = () => {
  window.addEventListener('beforeunload', onBeforeUnload);
};
