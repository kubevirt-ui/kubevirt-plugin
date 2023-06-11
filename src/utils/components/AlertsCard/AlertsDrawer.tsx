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
  Button,
  ButtonVariant,
  Flex,
  Label,
} from '@patternfly/react-core';

type AlertsDrawerProps = {
  sortedAlerts: SimplifiedAlerts;
};

const AlertsDrawer: React.FC<AlertsDrawerProps> = ({ sortedAlerts }) => {
  const [alertTypeOpen, setAlertTypeOpen] = React.useState<AlertType>(null);

  const [titleOpen, setTitleOpen] = React.useState<boolean>(false);
  const [defaultOpenCritical, setDefaultOpenCritical] = React.useState<boolean>(false);

  const handleDrawerToggleClick = React.useCallback((alertType: AlertType): void => {
    setAlertTypeOpen((alert) => (alert === alertType ? null : alertType));
  }, []);
  const alertsQuantity =
    Object.values(sortedAlerts)?.reduce((acc, category) => acc + category?.length, 0) || 0;

  React.useEffect(() => {
    //open critical alerts by default, if exists, only for the first time loading
    if (!defaultOpenCritical && !isEmpty(sortedAlerts?.critical)) {
      setTitleOpen(true);
      setAlertTypeOpen(AlertType.critical);
      setDefaultOpenCritical(true);
    }
  }, [sortedAlerts, defaultOpenCritical]);

  return (
    <div className="alerts-card__drawer">
      {alertsQuantity > 0 ? (
        <Accordion asDefinitionList isBordered>
          <AccordionItem>
            <AccordionToggle
              onClick={() => {
                setTitleOpen((title) => {
                  title && setAlertTypeOpen(null);
                  return !title;
                });
              }}
              className="alerts-card__toggle--main"
              id="toggle-main"
              isExpanded={titleOpen}
            >
              <Flex>
                {Object.keys(sortedAlerts)?.map((alertType) => {
                  const numAlerts = sortedAlerts?.[alertType]?.length;
                  // // Don't show alerts in the drawer header if there are no alerts of the type
                  if (numAlerts === 0) {
                    return null;
                  }
                  return (
                    <Button
                      onClick={(e) => {
                        setAlertTypeOpen((prevAlertOpen) =>
                          titleOpen && prevAlertOpen === alertType
                            ? null
                            : (alertType as AlertType),
                        );
                        setTitleOpen(
                          (prevTitleOpen) => !prevTitleOpen || alertTypeOpen !== alertType,
                        );
                        e?.stopPropagation();
                      }}
                      className="pf-m-link--align-left"
                      key={alertType}
                      variant={ButtonVariant.plain}
                    >
                      <Label
                        className="alerts-label"
                        color={labelColor[alertType]}
                        icon={labelIcon[alertType]}
                        key={alertType}
                      >
                        {numAlerts || 0}
                      </Label>
                      <span className="alerts-label--text">{labelText[alertType]}</span>
                    </Button>
                  );
                })}
              </Flex>
            </AccordionToggle>
            <AccordionContent id="toggle-main" isHidden={!titleOpen}>
              {Object.entries(sortedAlerts)?.map(([alertType, alerts]) => (
                <AlertsCardAccordionItem
                  alertOpen={alertTypeOpen}
                  alerts={alerts}
                  alertType={AlertType[alertType]}
                  handleDrawerToggleClick={handleDrawerToggleClick}
                  key={alertType}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}
    </div>
  );
};

export default AlertsDrawer;
