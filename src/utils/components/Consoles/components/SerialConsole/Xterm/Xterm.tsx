import * as React from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { canUseDOM, debounce } from '@patternfly/react-core';

import { onFocusIn, onFocusOut, XTermProps } from './utils/Xterm';

export const XTerm: React.FunctionComponent<XTermProps> = ({
  cols = 80,
  rows = 25,
  fontFamily,
  fontSize,
  onTitleChanged,
  onData,
  innerRef,
}) => {
  const [terminal] = React.useState<Terminal>(
    new Terminal({
      cols,
      rows,
      cursorBlink: true,
      fontFamily,
      fontSize,
      screenReaderMode: true,
    }),
  );
  const ref = React.useRef<HTMLDivElement>();

  React.useImperativeHandle(innerRef, () => ({
    // eslint-disable-next-line require-jsdoc
    focusterminall() {
      if (terminal) {
        terminal?.focus();
      }
    },
    /**
     * Backend sent data.
     *
     * @param {string} data String content to be writen into the terminall
     */
    onDataReceived: (data: string) => {
      if (terminal) {
        terminal?.write(data);
      }
    },
    /**
     * Backend closed connection.
     *
     * @param {string} reason String error to be written into the terminall
     */
    onConnectionClosed: (reason: string) => {
      if (terminal) {
        terminal?.write(`\x1b[31m${reason || 'disconnected'}\x1b[m\r\n`);
        terminal?.refresh(terminal.rows, terminal.rows); // start to end row
      }
    },
  }));

  React.useEffect(() => {
    const fitAddon = new FitAddon();
    onData && terminal?.onData(onData);
    onTitleChanged && terminal?.onTitleChange(onTitleChanged);
    terminal?.loadAddon(fitAddon);
    terminal?.open(ref?.current);
    const resizeListener = debounce(fitAddon?.fit, 100);
    canUseDOM && window.addEventListener('resize', resizeListener);
    fitAddon?.fit();

    return () => {
      terminal.dispose();
      canUseDOM && window.removeEventListener('resize', resizeListener);
      onFocusOut();
    };
  }, [onData, onTitleChanged, terminal]);

  return (
    <div
      ref={ref}
      className="pf-c-console__xterm"
      role="list"
      onFocus={onFocusIn}
      onBlur={onFocusOut}
    />
  );
};

XTerm.displayName = 'XTerm';
