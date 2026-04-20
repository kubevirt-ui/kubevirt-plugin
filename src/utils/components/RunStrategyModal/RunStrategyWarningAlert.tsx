import React, { FCC } from 'react';

import { Alert, AlertVariant, StackItem } from '@patternfly/react-core';

import { WarningMessage } from './utils';

type RunStrategyWarningAlertProps = {
  warningMessage: null | WarningMessage;
};

const RunStrategyWarningAlert: FCC<RunStrategyWarningAlertProps> = ({ warningMessage }) => {
  if (!warningMessage || !warningMessage.body) return null;
  return (
    <StackItem>
      <Alert isInline title={warningMessage.title} variant={AlertVariant.warning}>
        {warningMessage.body}
      </Alert>
    </StackItem>
  );
};

export default RunStrategyWarningAlert;
