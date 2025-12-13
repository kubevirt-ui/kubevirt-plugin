import * as React from 'react';

import AlertsCard from '@kubevirt-utils/components/AlertsCard/AlertsCard';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, Card, CardBody, CardHeader, CardTitle, Spinner } from '@patternfly/react-core';

import useSimplifiedAlerts from './hooks/useSimplifiedAlerts';

import './OverviewAlertsCard.scss';

const OverviewAlertsCard = () => {
  const { alerts: simplifiedAlerts, error, loaded } = useSimplifiedAlerts();
  const { t } = useKubevirtTranslation();
  if (!loaded || error) {
    return (
      <Card className="overview-alerts-card">
        <CardHeader>
          <CardTitle> {t('Alerts ({{alertsQuantity}})', { alertsQuantity: 0 })}</CardTitle>
        </CardHeader>
        <CardBody>
          {error ? (
            <ErrorAlert error={error} />
          ) : (
            <Bullseye>
              <Spinner />
            </Bullseye>
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <AlertsCard className="overview-alerts-card" isOverviewPage sortedAlerts={simplifiedAlerts} />
  );
};

export default OverviewAlertsCard;
