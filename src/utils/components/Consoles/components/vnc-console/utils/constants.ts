// follow the levels used by noVNC
// https://github.com/novnc/noVNC/blob/6d0a9746657b085c11309dc5356083fcbb018526/core/util/logging.js#L32
export type VncLogLevel = 'debug' | 'error' | 'info' | 'warn' | false | undefined;

// eslint-disable-next-line require-jsdoc
export function isVncLogLevel(value: unknown): value is VncLogLevel {
  return !value || ['debug', 'error', 'info', 'warn'].includes(value as string);
}

export const KUBEVIRT_UI_VNC_LOG_LEVEL_LABEL = 'kubevirt-ui/vnc-log-level';
