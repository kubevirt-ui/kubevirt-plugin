import { type FC, useEffect, useState } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { DISABLED_GUEST_SYSTEM_LOGS_ACCESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import {
  buildHyperConvergedPatch,
  getVirtualMachineOptionsPatchPath,
} from '@kubevirt-utils/resources/hyperconverged/patchUtils';
import { getDisableSerialConsoleLog } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import { type HyperConvergeConfigurationWatch } from '../../GeneralSettings/consts/consts';

import './guest-system-logs-access.scss';

type GuestSystemLogsAccessProps = {
  hyperConvergeConfiguration: HyperConvergeConfigurationWatch;
  newBadge?: boolean;
};

const GuestSystemLogsAccess: FC<GuestSystemLogsAccessProps> = ({
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
  const disableSerialConsoleLog = getDisableSerialConsoleLog(hyperConverge);

  const [error, setError] = useState<string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>();

  useEffect(() => {
    void guestSystemLogsAccessToggle(!!disableSerialConsoleLog);
    setIsChecked(!disableSerialConsoleLog);
  }, [disableSerialConsoleLog, guestSystemLogsAccessToggle]);

  const onChange = async (checked: boolean): Promise<void> => {
    setError(null);
    setIsLoading(true);
    try {
      await kubevirtK8sPatch<HyperConverged>({
        cluster,
        data: buildHyperConvergedPatch(hyperConverge, {
          op: 'replace',
          path: getVirtualMachineOptionsPatchPath(hyperConverge, 'disableSerialConsoleLog'),
          value: !checked,
        }),
        model: getHyperConvergedModelFromResource(hyperConverge),
        resource: hyperConverge,
      });
      void guestSystemLogsAccessToggle(!checked);
      setIsChecked(checked);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SectionWithSwitch
        dataTestID="guest-system-log"
        helpTextIconContent={t(
          "Enables access to the VirtualMachine's guest system log. Wait a few seconds for logging to start before viewing the log.",
        )}
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
