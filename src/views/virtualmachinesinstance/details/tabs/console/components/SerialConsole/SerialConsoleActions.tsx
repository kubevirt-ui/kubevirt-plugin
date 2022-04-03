import * as React from 'react';

import { Button } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Consoles/SerialConsole';

export type SerialConsoleActionsProps = React.HTMLProps<HTMLDivElement> & {
  onDisconnect: () => void;
  onReset: () => void;
  textDisconnect?: string;
  textReset?: string;
};

export const SerialConsoleActions: React.FunctionComponent<SerialConsoleActionsProps> = ({
  textDisconnect = 'Disconnect',
  textReset = 'Reset',
  onDisconnect,
  onReset,
}: SerialConsoleActionsProps) => (
  <div className={css(styles.consoleActionsSerial)}>
    <Button variant="secondary" onClick={onDisconnect}>
      {textDisconnect}
    </Button>
    <Button variant="secondary" onClick={onReset}>
      {textReset}
    </Button>
  </div>
);

SerialConsoleActions.displayName = 'SerialConsoleActions';
