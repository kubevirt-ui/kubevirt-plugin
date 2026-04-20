import React, { FCC, useEffect, useState } from 'react';

import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { DISABLED_GUEST_SYSTEM_LOGS_ACCESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import './guest-system-logs-access.scss';

type GuestSystemLogsAccessProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
  newBadge?: boolean;
};

const GuestSystemLogsAccess: FCC<GuestSystemLogsAccessProps> = ({
  hyperConvergeConfiguration,
  newBadge = false,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const { toggleFeature: guestSystemLogsAccessToggle } = useFeatures(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
    cluster,
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
    setError(null);
    setIsLoading(true);
    try {
      await kubevirtK8sPatch<HyperConverged>({
        cluster,
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
        dataTestID="guest-system-log"
        isDisabled={!hyperLoaded}
        isLoading={isLoading}
        newBadge={newBadge}
        olsPromptType={OLSPromptType.ENABLE_GUEST_SYSTEM_LOG_ACCESS}
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
