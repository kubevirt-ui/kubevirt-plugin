/** Contains significant parts of https://github.com/xtermjs/xterm.js/blob/c4b707e9ca8ba8e27cecb859fe80ccebeca7375a/addons/addon-attach/src/AttachAddon.ts
 *  Original comments and copyrights retained below.
 */

/**
 * Copyright (c) 2014, 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * Implements the attach method, that attaches the terminal to a WebSocket stream.
 */

import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import type { IDisposable, ITerminalAddon, Terminal } from '@xterm/xterm';

interface IAttachOptions {
  bidirectional?: boolean;
}

/**
 * Contrary to the @xterm/addon-attach use binaryType = 'blob' when sending/receiving to/from the server.
 * The blob mode(default for websockets) is the only supported mode by kubevirt.
 * As side effect we loose ability to separate text and binary messages
 *
 * see also https://github.com/xtermjs/xterm.js/discussions/4625
 */
export class BlobOnlyAttachAddon implements ITerminalAddon {
  private _bidirectional: boolean;
  private _disposables: IDisposable[] = [];
  private _socket: WebSocket;

  constructor(socket: WebSocket, options: IAttachOptions = { bidirectional: true }) {
    this._socket = socket;
    // enforce blob
    this._socket.binaryType = 'blob';
    this._bidirectional = !(options && options.bidirectional === false);
  }

  private _checkOpenSocket(): boolean {
    switch (this._socket.readyState) {
      case WebSocket.OPEN:
        return true;
      case WebSocket.CONNECTING:
        throw new Error('Attach addon was loaded before socket was open');
      case WebSocket.CLOSING:
        kubevirtConsole.warn('Attach addon socket is closing');
        return false;
      case WebSocket.CLOSED:
        throw new Error('Attach addon socket is closed');
      default:
        throw new Error('Unexpected socket state');
    }
  }

  private _sendBinary(data: string): void {
    if (!this._checkOpenSocket()) {
      return;
    }
    this._socket.send(new Blob([data]));
  }

  public activate(terminal: Terminal): void {
    this._disposables.push(
      addSocketListener(this._socket, 'message', (ev) => {
        const data: Blob = ev.data;
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            terminal.write(reader.result);
          }
        };
        reader.readAsText(data);
      }),
    );

    if (this._bidirectional) {
      this._disposables.push(terminal.onData((data) => this._sendBinary(data)));
    }

    this._disposables.push(addSocketListener(this._socket, 'close', () => this.dispose()));
    this._disposables.push(addSocketListener(this._socket, 'error', () => this.dispose()));
  }

  public dispose(): void {
    for (const d of this._disposables) {
      d.dispose();
    }
  }
}

/**
 *
 * @param socket -
 * @param type -
 * @param handler -
 * @returns
 */
export function addSocketListener<K extends keyof WebSocketEventMap>(
  socket: WebSocket,
  type: K,
  handler: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
): IDisposable {
  socket.addEventListener(type, handler);
  return {
    dispose: () => {
      if (!handler) {
        // Already disposed
        return;
      }
      socket.removeEventListener(type, handler);
    },
  };
}
