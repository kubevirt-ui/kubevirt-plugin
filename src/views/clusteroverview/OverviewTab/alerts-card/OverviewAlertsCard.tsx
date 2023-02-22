import * as React from 'react';

import AlertsCard from '@kubevirt-utils/components/AlertsCard/AlertsCard';

import useSimplifiedAlerts from './hooks/useSimplifiedAlerts';

import './OverviewAlertsCard.scss';

const OverviewAlertsCard = () => {
  const alerts = useSimplifiedAlerts();

  return <AlertsCard sortedAlerts={alerts} isOverviewPage className="overview-alerts-card" />;
};

export default OverviewAlertsCard;
