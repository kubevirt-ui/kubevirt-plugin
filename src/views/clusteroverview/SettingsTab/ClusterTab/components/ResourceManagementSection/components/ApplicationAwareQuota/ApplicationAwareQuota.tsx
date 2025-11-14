import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Button, Flex } from '@patternfly/react-core';

import ResourceCountingTypeSelect from './components/ResourceCountingTypeSelect';

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

  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const aaqEnabled = hyperConverge?.spec?.enableApplicationAwareQuota;

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
            vmiCalcConfigName: 'DedicatedVirtualResources',
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
          'AAQ manages resource quotas specifically for virtual machines. Unlike Kubernetes ResourceQuotas, AAQ is virtualization-aware and prevents issues such as failed live migrations due to quota limits.',
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
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            className="pf-v6-u-my-sm"
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
          >
            <div>{t('Resource counting type')}</div>
            <ResourceCountingTypeSelect
              hyperConverge={hyperConverge}
              isDisabled={!hyperLoaded}
              selectedValue={hyperConverge?.spec?.applicationAwareConfig?.vmiCalcConfigName}
            />
          </Flex>
          <Button onClick={() => navigate('/k8s/all-namespaces/quotas')} variant="link">
            {t('Manage virtualization quotas')}
          </Button>
        </>
      )}
    </>
  );
};

export default ApplicationAwareQuota;
