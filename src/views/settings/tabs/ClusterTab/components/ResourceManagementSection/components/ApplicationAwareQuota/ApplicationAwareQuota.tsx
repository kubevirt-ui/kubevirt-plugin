import React, { FC, useEffect, useMemo, useState } from 'react';
import { getQuotaListURL } from 'src/views/quotas/utils/url';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HyperConvergedModel } from '@kubevirt-utils/models';
import { getAAQCalculationMethod } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { isAAQEnabled } from '@kubevirt-utils/resources/hyperconverged/utils';
import { CalculationMethod } from '@kubevirt-utils/resources/quotas/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { Alert, AlertVariant, Flex } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import SettingsLink from '@settings/context/SettingsLink';

import EditCalculationMethodButton from './components/EditCalculationMethodButton';
import QuotaCalculationMethodTerm from './components/QuotaCalculationMethodTerm';
import { getCalculationMethodContentMapper } from './constants';

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

  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const aaqEnabled = isAAQEnabled(hyperConverge);

  const [isEnabled, setIsEnabled] = useState<boolean>(aaqEnabled);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    setIsEnabled(hyperLoaded ? aaqEnabled : false);
  }, [aaqEnabled, cluster, hyperLoaded]);

  const onFeatureChange = (checked: boolean) => {
    setIsLoading(true);
    kubevirtK8sPatch<HyperConverged>({
      cluster,
      data: [
        {
          op: isEmpty(aaqEnabled) ? 'add' : 'replace',
          path: `/spec/enableApplicationAwareQuota`,
          value: checked,
        },
        {
          op: isEmpty(hyperConverge?.spec?.applicationAwareConfig) ? 'add' : 'replace',
          path: `/spec/applicationAwareConfig`,
          value: {
            allowApplicationAwareClusterResourceQuota: true,
            vmiCalcConfigName: CalculationMethod.VirtualResources,
          },
        },
      ],
      model: HyperConvergedModel,
      resource: hyperConverge,
    })
      .then(() => setIsEnabled(checked))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <SectionWithSwitch
        helpTextIconContent={t(
          'Extends ResourceQuota by managing quotas for VM workloads as well as pods and other resource limits. AAQ is virtualization-aware and helps prevent issues such as failing live migrations due to quota limits.',
        )}
        isDisabled={!hyperLoaded}
        isLoading={isLoading}
        newBadge={newBadge}
        olsPromptType={OLSPromptType.APPLICATION_AWARE_QUOTA}
        switchIsOn={isEnabled}
        title={t('Application Aware Quota (AAQ)')}
        turnOnSwitch={onFeatureChange}
      />
      {error && (
        <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
          {error}
        </Alert>
      )}
      {isEnabled && (
        <>
          <Flex className="pf-v6-u-mt-sm pf-v6-u-mb-xs" spaceItems={{ default: 'spaceItems2xl' }}>
            <QuotaCalculationMethodTerm
              calculationMethodContentMapper={calculationMethodContentMapper}
            />
            <EditCalculationMethodButton
              calculationMethodContentMapper={calculationMethodContentMapper}
              hyperConverge={hyperConverge}
              selectedCalculationMethod={getAAQCalculationMethod(hyperConverge)}
            />
          </Flex>
          <SettingsLink showExternalIcon to={getQuotaListURL()}>
            {t('Manage quotas')}
          </SettingsLink>
        </>
      )}
    </>
  );
};

export default ApplicationAwareQuota;
