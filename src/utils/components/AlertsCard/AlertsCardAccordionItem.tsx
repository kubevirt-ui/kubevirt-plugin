import React, { type FC, type ReactElement } from 'react';

import AlertStatusItem from '@kubevirt-utils/components/AlertsCard/AlertStatusItem';
import { AlertType, type SimplifiedAlert } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Divider,
  Label,
} from '@patternfly/react-core';

import AlertsClusterAccordion from './AlertsClusterAccordion';
import AlertStatusItemACM from './AlertStatusItemACM';

import './AlertsCard.scss';

type AlertsCardAccordionItemProps = {
  alertOpen: AlertType;
  alerts: SimplifiedAlert[];
  alertType: AlertType;
  handleDrawerToggleClick: (alertType: AlertType) => void;
};

const AlertsCardAccordionItem: FC<AlertsCardAccordionItemProps> = ({
  alertOpen,
  alerts,
  alertType,
  handleDrawerToggleClick,
}): ReactElement => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage() as boolean;
  const isAllClustersPage = useIsAllClustersPage() as boolean;

  const alertTitle: Record<string, string> = {
    [AlertType.Critical]: t('Critical'),
    [AlertType.Info]: t('Info'),
    [AlertType.Warning]: t('Warnings'),
  };

  const renderAlerts = (): ReactElement | ReactElement[] => {
    if (isAllClustersPage) {
      return <AlertsClusterAccordion alerts={alerts} alertType={alertType} />;
    }

    return alerts?.map((alert) => (
      <div className="content" key={alert?.key}>
        {isACMPage ? (
          <AlertStatusItemACM alertDetails={alert} alertType={alertType} />
        ) : (
          <AlertStatusItem alertDetails={alert} alertType={alertType} />
        )}
      </div>
    ));
  };

  const isExpanded: boolean = alertOpen === alertType;

  return (
    <AccordionItem isExpanded={isExpanded}>
      <AccordionToggle
        onClick={() => {
          handleDrawerToggleClick(alertType);
        }}
        className="alerts-card__toggle--item"
        id={alertType}
      >
        <div className="subtitle">
          <span className="subtitle-name">{alertTitle?.[alertType]}</span>
          <Label className="subtitle-label" isCompact>
            {alerts?.length ?? 0}
          </Label>
        </div>
      </AccordionToggle>
      {isExpanded && (
        <AccordionContent id={alertType} key={alertType}>
          <Divider />
          {renderAlerts()}
        </AccordionContent>
      )}
    </AccordionItem>
  );
};

export default AlertsCardAccordionItem;
