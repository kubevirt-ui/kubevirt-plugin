import * as React from 'react';

import AlertsCard from '@kubevirt-utils/components/AlertsCard/AlertsCard';

import useAlerts from './hooks/useAlerts';

import './OverviewAlertsCard.scss';

const OverviewAlertsCard = () => {
  const alerts = useAlerts();

  return <AlertsCard sortedAlerts={alerts} isOverviewPage className="overview-alerts-card" />;
};

export default OverviewAlertsCard;
