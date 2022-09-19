import React from 'react';

import AlertStatusItem from '@kubevirt-utils/components/AlertsCard/AlertStatusItem';
import { AlertType } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Divider,
  Label,
} from '@patternfly/react-core';

import './AlertsCard.scss';

type AlertsCardAccordionItemProps = {
  alerts: any;
  alertType: AlertType;
  handleDrawerToggleClick: (alertType: AlertType) => void;
  alertOpen: AlertType;
};

const AlertsCardAccordionItem: React.FC<AlertsCardAccordionItemProps> = ({
  alerts,
  handleDrawerToggleClick,
  alertOpen,
  alertType,
}) => {
  const { t } = useKubevirtTranslation();

  const alertTitle = {
    [AlertType.warning]: t('Warnings'),
    [AlertType.critical]: t('Critical'),
    [AlertType.info]: t('Info'),
  };

  return (
    <AccordionItem>
      <AccordionToggle
        onClick={() => {
          handleDrawerToggleClick(alertType);
        }}
        isExpanded={alertOpen === alertType}
        id={alertType}
        className="alerts-card__toggle--item"
      >
        <div className="subtitle">
          <span className="subtitle-name">{alertTitle?.[alertType]}</span>
          <Label isCompact className="subtitle-label">
            {alerts?.length || 0}
          </Label>
        </div>
      </AccordionToggle>
      <AccordionContent id={alertType} key={alertType} isHidden={alertOpen !== alertType}>
        <Divider />
        {alerts?.map((alert) => (
          <div className="content" key={alert?.key}>
            <AlertStatusItem alertDetails={alert} alertType={alertType} />
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

export default AlertsCardAccordionItem;
