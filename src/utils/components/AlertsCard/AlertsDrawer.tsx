import React from 'react';

import AlertsCardAccordionItem from '@kubevirt-utils/components/AlertsCard/AlertsCardAccordionItem';
import { AlertType, SimplifiedAlerts } from '@kubevirt-utils/components/AlertsCard/utils/types';
import {
  labelColor,
  labelIcon,
  labelText,
} from '@kubevirt-utils/components/AlertsCard/utils/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Flex,
  Label,
} from '@patternfly/react-core';

type AlertsDrawerProps = {
  sortedAlerts: SimplifiedAlerts;
};

const AlertsDrawer: React.FC<AlertsDrawerProps> = ({ sortedAlerts }) => {
  const [alertOpen, setAlertOpen] = React.useState<AlertType>(null);
  const [titleOpen, setTitleOpen] = React.useState<boolean>(false);
  const [defaultOpenCritical, setDefaultOpenCritical] = React.useState<boolean>(false);

  const handleDrawerToggleClick = React.useCallback((alertType: AlertType): void => {
    setAlertOpen((alert) => (alert === alertType ? null : alertType));
  }, []);

  React.useEffect(() => {
    //open critical alerts by default, if exists, only for the first time loading
    if (!defaultOpenCritical && !isEmpty(sortedAlerts?.critical)) {
      setTitleOpen(true);
      setAlertOpen(AlertType.critical);
      setDefaultOpenCritical(true);
    }
  }, [sortedAlerts, defaultOpenCritical]);

  return (
    <div className="alerts-card__drawer">
      <Accordion isBordered asDefinitionList>
        <AccordionItem>
          <AccordionToggle
            onClick={() => {
              setTitleOpen((title) => !title);
            }}
            isExpanded={titleOpen}
            id="toggle-main"
            className="alerts-card__toggle--main"
          >
            <Flex>
              {Object.keys(sortedAlerts)?.map((alertType) => {
                const numAlerts = sortedAlerts?.[alertType]?.length;
                // Don't show critical or warning alerts in the drawer header if there are no alerts of that type
                if (
                  (alertType === AlertType.critical || alertType === AlertType.warning) &&
                  numAlerts === 0
                ) {
                  return null;
                }

                return (
                  <span key={alertType}>
                    <Label
                      key={alertType}
                      color={labelColor[alertType]}
                      icon={labelIcon[alertType]}
                      className="alerts-label"
                    >
                      {numAlerts || 0}
                    </Label>
                    <span className="alerts-label--text">{labelText[alertType]}</span>
                  </span>
                );
              })}
            </Flex>
          </AccordionToggle>
          <AccordionContent id="toggle-main" isHidden={!titleOpen}>
            {Object.entries(sortedAlerts)?.map(([alertType, alerts]) => (
              <AlertsCardAccordionItem
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
  );
};

export default AlertsDrawer;
