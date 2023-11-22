import * as React from 'react';

import AlertsCard from '@kubevirt-utils/components/AlertsCard/AlertsCard';

import useSimplifiedAlerts from './hooks/useSimplifiedAlerts';

import './OverviewAlertsCard.scss';

const OverviewAlertsCard = () => {
  const alerts = useSimplifiedAlerts();

  return <AlertsCard className="overview-alerts-card" isOverviewPage sortedAlerts={alerts} />;
};

export default OverviewAlertsCard;
