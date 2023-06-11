import * as React from 'react';

export type AccessConsolesProps = {
  /**
   * Child element can be either
   *   - <SerialConsole>, <VncConsole> or <DesktopViewer>
   *   - or has a property "type" of value either SERIAL_CONSOLE_TYPE or VNC_CONSOLE_TYPE (useful when wrapping (composing) basic console components
   */
  children?: React.ReactElement[] | React.ReactNode;
  /** Initial selection of the Select */
  preselectedType?: string; // NONE_TYPE | SERIAL_CONSOLE_TYPE | VNC_CONSOLE_TYPE | DESKTOP_VIEWER_CONSOLE_TYPE;
  /** The value for the Desktop Viewer Console option. This can be overriden by the type property of the child component */
  textDesktopViewerConsole?: string;
  /** Placeholder text for the console selection */
  textSelectConsoleType?: string;
  /** The value for the Serial Console option. This can be overriden by the type property of the child component */
  textSerialConsole?: string;
  /** The value for the VNC Console option. This can be overriden by the type property of the child component */
  textVncConsole?: string;
};

export const getChildTypeName = (child: any) =>
  child && child.props && child.props.type
    ? child.props.type
    : (child && child.type && child.type.displayName) || null;

export const getConsoleForType = (consoleType: any, children) =>
  React.Children.map(children as React.ReactElement[], (child: any) => {
    if (getChildTypeName(child) === consoleType?.value) {
      return <React.Fragment key={getChildTypeName(child)}>{child}</React.Fragment>;
    } else {
      return null;
    }
  });
