import React, { FC, useEffect, useState } from 'react';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { DISABLED_GUEST_SYSTEM_LOGS_ACCESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant } from '@patternfly/react-core';

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
  const { toggleFeature: guestSystemLogsAccessToggle } = useFeatures(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );
  const disableSerialConsoleLog =
    hyperConverge?.spec?.virtualMachineOptions?.disableSerialConsoleLog;

  const [error, setError] = useState<string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>();

  useEffect(() => {
    guestSystemLogsAccessToggle(!!disableSerialConsoleLog);
    setIsChecked(!disableSerialConsoleLog);
  }, [disableSerialConsoleLog, guestSystemLogsAccessToggle]);

  const onChange = async (checked: boolean) => {
    setIsLoading(true);
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
      guestSystemLogsAccessToggle(!checked);
      setIsChecked(checked);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SectionWithSwitch
        helpTextIconContent={t(
          "Enables access to the VirtualMachine's guest system log. Wait a few seconds for logging to start before viewing the log.",
        )}
        isDisabled={!hyperLoaded}
        isLoading={isLoading}
        newBadge={newBadge}
        switchIsOn={isChecked}
        title={t('Enable guest system log access')}
        turnOnSwitch={onChange}
      />
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
