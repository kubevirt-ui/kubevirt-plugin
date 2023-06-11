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
  alertOpen: AlertType;
  alerts: any;
  alertType: AlertType;
  handleDrawerToggleClick: (alertType: AlertType) => void;
};

const AlertsCardAccordionItem: React.FC<AlertsCardAccordionItemProps> = ({
  alertOpen,
  alerts,
  alertType,
  handleDrawerToggleClick,
}) => {
  const { t } = useKubevirtTranslation();

  const alertTitle = {
    [AlertType.critical]: t('Critical'),
    [AlertType.info]: t('Info'),
    [AlertType.warning]: t('Warnings'),
  };

  return (
    <AccordionItem>
      <AccordionToggle
        onClick={() => {
          handleDrawerToggleClick(alertType);
        }}
        className="alerts-card__toggle--item"
        id={alertType}
        isExpanded={alertOpen === alertType}
      >
        <div className="subtitle">
          <span className="subtitle-name">{alertTitle?.[alertType]}</span>
          <Label className="subtitle-label" isCompact>
            {alerts?.length || 0}
          </Label>
        </div>
      </AccordionToggle>
      <AccordionContent id={alertType} isHidden={alertOpen !== alertType} key={alertType}>
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
