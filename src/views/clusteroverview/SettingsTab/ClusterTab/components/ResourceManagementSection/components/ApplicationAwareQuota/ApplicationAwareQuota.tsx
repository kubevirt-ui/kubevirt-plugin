import React, { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getQuotaListURL } from 'src/views/quotas/utils/url';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HyperConvergedModel } from '@kubevirt-utils/models';
import { getAAQCalculationMethod } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { isAAQEnabled } from '@kubevirt-utils/resources/hyperconverged/utils';
import { CalculationMethod } from '@kubevirt-utils/resources/quotas/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Button, Flex } from '@patternfly/react-core';

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
  const navigate = useNavigate();
  const calculationMethodContentMapper = useMemo(() => getCalculationMethodContentMapper(t), [t]);

  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const aaqEnabled = isAAQEnabled(hyperConverge);

  const [isEnabled, setIsEnabled] = useState<boolean>(aaqEnabled);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);

  const onFeatureChange = (checked: boolean) => {
    setIsLoading(true);
    k8sPatch<HyperConverged>({
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
          <Button onClick={() => navigate(getQuotaListURL())} variant="link">
            {t('Manage quotas')}
          </Button>
        </>
      )}
    </>
  );
};

export default ApplicationAwareQuota;
