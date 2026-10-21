import { type FC, useEffect, useMemo, useState } from 'react';
import { getQuotaListURL } from 'src/views/quotas/utils/url';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import {
  getAAQCalculationMethod,
  isAAQEnabled,
} from '@kubevirt-utils/resources/hyperconverged/selectors';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import SettingsLink from '@settings/context/SettingsLink';

import QuotaCalculationMethodTerm from './components/QuotaCalculationMethodTerm';
import { DEFAULT_CALCULATION_METHOD, getCalculationMethodContentMapper } from './constants';
import { buildAAQEnablePatches } from './utils';

type ApplicationAwareQuotaProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
  newBadge?: boolean;
};

const ApplicationAwareQuota: FC<ApplicationAwareQuotaProps> = ({
  hyperConvergeConfiguration,
  newBadge = false,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const calculationMethodContentMapper = useMemo(() => getCalculationMethodContentMapper(t), [t]);

  const [hyperConverge] = hyperConvergeConfiguration;
  const clusterAaqEnabled = isAAQEnabled(hyperConverge);

  const [aaqEnabledOnUi, setAaqEnabledOnUi] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    setAaqEnabledOnUi(clusterAaqEnabled);
  }, [clusterAaqEnabled]);

  const onFeatureChange = (checked: boolean): void => {
    if (isLoading) {
      return;
    }
    setError(null);
    setAaqEnabledOnUi(checked);
    setIsLoading(true);
    kubevirtK8sPatch<HyperConverged>({
      cluster,
      data: buildAAQEnablePatches(hyperConverge, checked),
      model: getHyperConvergedModelFromResource(hyperConverge),
      resource: hyperConverge,
    })
      .catch((err) => {
        setError(err.message);
        setAaqEnabledOnUi(clusterAaqEnabled);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <SectionWithSwitch
        dataTestID="application-aware-quota"
        helpTextIconContent={t(
          'Extends ResourceQuota by managing quotas for VM workloads as well as pods and other resource limits. AAQ is virtualization-aware and helps prevent issues such as failing live migrations due to quota limits.',
        )}
        isLoading={isLoading}
        newBadge={newBadge}
        olsPromptType={OLSPromptType.APPLICATION_AWARE_QUOTA}
        switchIsOn={aaqEnabledOnUi}
        title={t('Application Aware Quota (AAQ)')}
        turnOnSwitch={onFeatureChange}
      />
      {error && (
        <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
          {error}
        </Alert>
      )}
      {aaqEnabledOnUi && (
        <>
          <QuotaCalculationMethodTerm
            calculationMethodContentMapper={calculationMethodContentMapper}
            hyperConverge={hyperConverge}
            selectedCalculationMethod={
              getAAQCalculationMethod(hyperConverge) ?? DEFAULT_CALCULATION_METHOD
            }
          />
          <SettingsLink showExternalIcon to={getQuotaListURL()}>
            {t('Manage quotas')}
          </SettingsLink>
        </>
      )}
    </>
  );
};

export default ApplicationAwareQuota;
