import React, { FC } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Bullseye } from '@patternfly/react-core';

import useWatchCheckupData from '../../hooks/useWatchCheckupData';

const CheckupsSelfValidationYAMLTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const { configMap, loaded } = useWatchCheckupData();

  if (!loaded)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

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
