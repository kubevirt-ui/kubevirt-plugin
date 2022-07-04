import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Card,
  CardHeader,
  CardTitle,
  Divider,
  Flex,
  Label,
} from '@patternfly/react-core';

import useVMAlerts from './hook/useVMAlerts';
import { AlertType, color, icon } from './utils/utils';
import VirtualMachinesOverviewTabAlertsAccordionItem from './VirtualMachinesOverviewTabAlertsAccordionItem';

import './virtual-machines-overview-tab-alerts.scss';

type VirtualMachinesOverviewTabAlertsProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabAlerts: React.FC<VirtualMachinesOverviewTabAlertsProps> = ({
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const vmAlerts = useVMAlerts(vm);
  const [alertOpen, setAlertOpen] = React.useState<AlertType>(null);
  const [titleOpen, setTitleOpen] = React.useState<boolean>(false);
  const [defaultOpenCritical, setDefaultOpenCritical] = React.useState<boolean>(false);

  const handleDrawerToggleClick = React.useCallback((alertType: AlertType): void => {
    setAlertOpen((alert) => (alert === alertType ? null : alertType));
  }, []);

  const alertsQuantity =
    Object.values(vmAlerts)?.reduce((acc, alerts) => acc + alerts?.length, 0) || 0;

  React.useEffect(() => {
    //open critical alerts by default, if exists, only for the first time loading
    if (!defaultOpenCritical && !isEmpty(vmAlerts?.critical)) {
      setTitleOpen(true);
      setAlertOpen(AlertType.critical);
      setDefaultOpenCritical(true);
    }
  }, [vmAlerts, defaultOpenCritical]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted card-title">
          {t('Alerts ({{alertsQuantity}})', { alertsQuantity })}
        </CardTitle>
      </CardHeader>
      <Divider />
      <div className="VirtualMachinesOverviewTabAlerts__drawer">
        <Accordion asDefinitionList>
          <AccordionItem>
            <AccordionToggle
              onClick={() => {
                setTitleOpen((title) => !title);
              }}
              isExpanded={titleOpen}
              id="toggle-main"
            >
              <Flex>
                {Object.keys(vmAlerts)?.map((alertType) => (
                  <Label key={alertType} color={color[alertType]} icon={icon[alertType]}>
                    {vmAlerts?.[alertType]?.length || 0}
                  </Label>
                ))}
              </Flex>
            </AccordionToggle>
            <AccordionContent id="toggle-main" isHidden={!titleOpen}>
              {Object.entries(vmAlerts)?.map(([alertType, alerts]) => (
                <VirtualMachinesOverviewTabAlertsAccordionItem
                  key={alertType}
                  alertOpen={alertOpen}
                  alertType={AlertType[alertType]}
                  alerts={alerts}
                  handleDrawerToggleClick={handleDrawerToggleClick}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Card>
  );
};

export default VirtualMachinesOverviewTabAlerts;
