import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { selectOverviewDetailsTab } from '@console/internal/actions/ui';
import {
  AlertSeverityIcon,
  getFiringAlerts,
  getSeverityAlertType,
  shouldHideMonitoringAlertDecorator,
} from '@console/shared';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { Node, SELECTION_EVENT } from '@patternfly/react-topology';

import Decorator from './Decorator';

type DispatchProps = {
  showMonitoringOverview?: () => void;
};

const dispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  showMonitoringOverview: () => dispatch(selectOverviewDetailsTab('Observe')),
});

interface MonitoringAlertsDecoratorProps {
  element: Node;
  radius: number;
  x: number;
  y: number;
}

type MonitoringAlertsDecoratorType = MonitoringAlertsDecoratorProps & DispatchProps;

const MonitoringAlertsDecorator: React.FC<MonitoringAlertsDecoratorType> = ({
  element,
  radius,
  x,
  y,
  showMonitoringOverview,
}) => {
  const { t } = useTranslation();
  const workloadData = element.getData().data;
  const { monitoringAlerts } = workloadData;
  const firingAlerts = getFiringAlerts(monitoringAlerts);
  const severityAlertType = getSeverityAlertType(firingAlerts);

  const showSidebar = (e: React.MouseEvent) => {
    e.stopPropagation();
    showMonitoringOverview();
    element.getGraph().getController().fireEvent(SELECTION_EVENT, [element.getId()]);
  };

  if (shouldHideMonitoringAlertDecorator(severityAlertType)) return null;

  const label = t('kubevirt-plugin~Monitoring alert');
  return (
    <Tooltip key="monitoringAlert" content={label} position={TooltipPosition.left}>
      <Decorator x={x} y={y} radius={radius} onClick={showSidebar} ariaLabel={label}>
        <g transform={`translate(-${radius / 2}, -${radius / 2})`}>
          <AlertSeverityIcon severityAlertType={severityAlertType} fontSize={radius} />
        </g>
      </Decorator>
    </Tooltip>
  );
};

export default connect<null, DispatchProps, MonitoringAlertsDecoratorProps>(
  null,
  dispatchToProps,
)(MonitoringAlertsDecorator);
