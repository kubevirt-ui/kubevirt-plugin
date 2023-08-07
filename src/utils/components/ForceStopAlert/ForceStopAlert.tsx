import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';
import { stopVM } from '@virtualmachines/actions/actions';

import './ForceStopAlert.scss';

type ForceStopAlertProps = {
  vm: V1VirtualMachine;
};
const ForceStopAlert: FC<ForceStopAlertProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const vmStatus = vm?.status?.printableStatus;
  if (vmStatus !== 'Stopping') return null;

  return (
    <Alert
      className="force-stop-alert"
      isInline
      title={t('This VirtualMachine is stopping.')}
      variant={AlertVariant.warning}
    >
      <Trans t={t}>
        There was an error processing the request. Click <strong> Force stop </strong>
        to complete the shutdown.
      </Trans>
      <div className="force-stop-button">
        <Button
          isInline
          key="confirm"
          onClick={() => stopVM(vm, { gracePeriod: 0 })}
          variant={ButtonVariant.link}
        >
          {t('Force stop')}
        </Button>
      </div>
    </Alert>
  );
};

export default ForceStopAlert;
