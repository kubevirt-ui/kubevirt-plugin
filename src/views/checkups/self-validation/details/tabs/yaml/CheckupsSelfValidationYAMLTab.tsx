import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Bullseye } from '@patternfly/react-core';

import useCheckupsSelfValidationData from '../../../components/hooks/useCheckupsSelfValidationData';

const CheckupsSelfValidationYAMLTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const { checkupName } = useParams<{ checkupName: string }>();
  const { configMaps, loaded } = useCheckupsSelfValidationData();

  if (!loaded)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  const configMap = configMaps?.find((cm) => cm?.metadata?.name === checkupName);

  if (!configMap) {
    return (
      <Alert isInline title={t('ConfigMap not found')} variant={AlertVariant.warning}>
        {t('The ConfigMap for this checkup could not be found.')}
      </Alert>
    );
  }

  return <ResourceYAMLEditor initialResource={configMap} readOnly />;
};

export default CheckupsSelfValidationYAMLTab;
