import React, { FC, useEffect, useState } from 'react';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import NewBadge from '@kubevirt-utils/components/NewBadge/NewBadge';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  PopoverPosition,
  Split,
  SplitItem,
  Switch,
} from '@patternfly/react-core';

import './guest-system-logs-access.scss';

type GuestSystemLogsAccessProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
  newBadge?: boolean;
};

const GuestSystemLogsAccess: FC<GuestSystemLogsAccessProps> = ({
  hyperConvergeConfiguration,
  newBadge = false,
}) => {
  const { t } = useKubevirtTranslation();
  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const disableSerialConsoleLog =
    hyperConverge?.spec?.virtualMachineOptions?.disableSerialConsoleLog;

  const [error, setError] = useState<Error>(null);
  const [isChecked, setIsChecked] = useState<boolean>();

  useEffect(() => setIsChecked(!disableSerialConsoleLog), [disableSerialConsoleLog]);

  const onChange = async (checked: boolean) => {
    try {
      await k8sPatch<HyperConverged>({
        data: [
          {
            op: 'replace',
            path: `/spec/virtualMachineOptions/disableSerialConsoleLog`,
            value: !checked,
          },
        ],
        model: HyperConvergedModel,
        resource: hyperConverge,
      });
      setIsChecked(checked);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Split>
        <SplitItem isFilled>
          {t('Enable guest system log access')}{' '}
          <HelpTextIcon
            bodyContent={t(
              "Enables access to the VirtualMachine's guest system log. Wait a few seconds for logging to start before viewing the log.",
            )}
            position={PopoverPosition.bottom}
          />
          {newBadge && <NewBadge />}
        </SplitItem>
        {hyperLoaded && (
          <SplitItem>
            <Switch id="guest-system-log-access" isChecked={isChecked} onChange={onChange} />
          </SplitItem>
        )}
      </Split>
      {error && (
        <Alert
          className="GuestSystemLogsAccess--alert"
          isInline
          title={t('Error')}
          variant={AlertVariant.danger}
        >
          {error}
        </Alert>
      )}
    </>
  );
};

export default GuestSystemLogsAccess;
