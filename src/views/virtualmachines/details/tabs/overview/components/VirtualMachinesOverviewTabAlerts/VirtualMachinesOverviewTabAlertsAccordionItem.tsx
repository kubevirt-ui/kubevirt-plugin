import React from 'react';
import { Link } from 'react-router-dom';

import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Divider,
  Label,
} from '@patternfly/react-core';

import { AlertType } from './utils/utils';

import './virtual-machines-overview-tab-alerts.scss';

type VirtualMachinesOverviewTabAlertsAccordionItemProps = {
  alerts: any;
  alertType: AlertType;
  handleDrawerToggleClick: (alertType: AlertType) => void;
  alertOpen: AlertType;
};

const VirtualMachinesOverviewTabAlertsAccordionItem: React.FC<
  VirtualMachinesOverviewTabAlertsAccordionItemProps
> = ({ alerts, handleDrawerToggleClick, alertOpen, alertType }) => {
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
      >
        <div className="subtitle">{alertTitle?.[alertType]}</div>
        <Label isCompact className="subtitle-label">
          {alerts?.length || 0}
        </Label>
      </AccordionToggle>
      <Divider />
      {alerts?.map((alert) => (
        <AccordionContent id={alertType} key={alert?.time} isHidden={alertOpen !== alertType}>
          <div className="content">
            <div className="alert-title">
              <span className="alert-name">{alert?.alertName}</span>
              <Link to={alert?.link}>{t('View Alert')}</Link>
            </div>
            <div className="alert-description">{alert?.description}</div>
            <div>
              <Timestamp timestamp={alert?.time} />
            </div>
          </div>
        </AccordionContent>
      ))}
    </AccordionItem>
  );
};

export default VirtualMachinesOverviewTabAlertsAccordionItem;
