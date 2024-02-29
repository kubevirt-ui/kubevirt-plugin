import * as React from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  onDisconnect,
  onReset,
  textDisconnect = t('Disconnect'),
  textReset = t('Reset'),
}: SerialConsoleActionsProps) => (
  <div className={css(styles.consoleActionsSerial)}>
    <Button className="btn-margin" onClick={onDisconnect} variant="secondary">
      {textDisconnect}
    </Button>
    <Button onClick={onReset} variant="secondary">
      {textReset}
    </Button>
  </div>
);

SerialConsoleActions.displayName = 'SerialConsoleActions';
