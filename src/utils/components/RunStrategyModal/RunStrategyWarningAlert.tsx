import { type FC } from 'react';

import { Alert, AlertVariant, StackItem } from '@patternfly/react-core';

import { type WarningMessage } from './utils';

type RunStrategyWarningAlertProps = {
  warningMessage: null | WarningMessage;
};

const RunStrategyWarningAlert: FC<RunStrategyWarningAlertProps> = ({ warningMessage }) => {
  if (!warningMessage?.body) return null;
  return (
    <StackItem>
      <Alert isInline title={warningMessage.title} variant={AlertVariant.warning}>
        {warningMessage.body}
      </Alert>
    </StackItem>
  );
};

export default RunStrategyWarningAlert;
