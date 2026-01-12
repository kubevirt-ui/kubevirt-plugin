import React, { useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Divider,
  Label,
} from '@patternfly/react-core';

import { AlertType, SimplifiedAlert } from './utils/types';
import AlertStatusItemACM from './AlertStatusItemACM';

import './AlertsCard.scss';

type AlertsClusterAccordionProps = {
  alerts: SimplifiedAlert[];
  alertType: AlertType;
};

// Group alerts by cluster name
const groupAlertsByCluster = (alerts: SimplifiedAlert[]): Record<string, SimplifiedAlert[]> => {
  return alerts?.reduce<Record<string, SimplifiedAlert[]>>((acc, alert) => {
    const clusterKey = alert?.cluster || '';
    if (!acc[clusterKey]) {
      acc[clusterKey] = [];
    }
    acc[clusterKey].push(alert);
    return acc;
  }, {});
};

/**
 * ACM-specific component that groups alerts by cluster in collapsible accordion panels.
 * Used on ACM pages to organize alerts by their source cluster.
 * @param root0
 * @param root0.alerts
 * @param root0.alertType
 */
const AlertsClusterAccordion: React.FC<AlertsClusterAccordionProps> = ({ alerts, alertType }) => {
  const { t } = useKubevirtTranslation();
  const [expandedClusters, setExpandedClusters] = useState<Record<string, boolean>>({});

  const alertsByCluster = useMemo(() => groupAlertsByCluster(alerts), [alerts]);
  const clusterNames = useMemo(() => Object.keys(alertsByCluster).sort(), [alertsByCluster]);

  const toggleClusterAccordion = (clusterName: string) => {
    setExpandedClusters((prev) => ({
      ...prev,
      [clusterName]: !prev[clusterName],
    }));
  };

  return (
    <Accordion className="alerts-card__cluster-accordion">
      {clusterNames.map((clusterName) => {
        const clusterAlerts = alertsByCluster[clusterName];
        const accordionId = `${alertType}-${clusterName}`;

        return (
          <AccordionItem isExpanded={expandedClusters[clusterName]} key={accordionId}>
            <AccordionToggle
              className="alerts-card__cluster-toggle"
              id={`${accordionId}-toggle`}
              onClick={() => toggleClusterAccordion(clusterName)}
            >
              <span className="alerts-card__cluster-toggle--text">
                {t('Cluster: {{clusterName}}', { clusterName })}
              </span>
              <Label className="alerts-card__cluster-toggle--label" isCompact>
                {clusterAlerts?.length || 0}
              </Label>
            </AccordionToggle>
            <Divider />
            <AccordionContent
              className="alerts-card__cluster-content"
              id={`${accordionId}-content`}
            >
              {clusterAlerts?.map((alert) => (
                <div className="content" key={alert?.key}>
                  <AlertStatusItemACM alertDetails={alert} alertType={alertType} />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default AlertsClusterAccordion;
