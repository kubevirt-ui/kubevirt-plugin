import React, { type FC, type ReactElement, useCallback, useEffect, useState } from 'react';

import AlertsCardAccordionItem from '@kubevirt-utils/components/AlertsCard/AlertsCardAccordionItem';
import {
  AlertType,
  type SimplifiedAlerts,
} from '@kubevirt-utils/components/AlertsCard/utils/types';
import { labelStatus, labelText } from '@kubevirt-utils/components/AlertsCard/utils/utils';
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

const AlertsDrawer: FC<AlertsDrawerProps> = ({ sortedAlerts }): ReactElement => {
  const [alertTypeOpen, setAlertTypeOpen] = useState<AlertType>(null);

  const [titleOpen, setTitleOpen] = useState<boolean>(false);
  const [defaultOpenCritical, setDefaultOpenCritical] = useState<boolean>(false);

  const handleDrawerToggleClick = useCallback((alertType: AlertType): void => {
    setAlertTypeOpen((alert) => (alert === alertType ? null : alertType));
  }, []);
  const alertsQuantity: number =
    Object.values(sortedAlerts)?.reduce((acc, category) => acc + category?.length, 0) ?? 0;

  useEffect(() => {
    //open critical alerts by default, if exists, only for the first time loading
    if (!defaultOpenCritical && !isEmpty(sortedAlerts?.critical)) {
      setTitleOpen(true);
      setAlertTypeOpen(AlertType.Critical);
      setDefaultOpenCritical(true);
    }
  }, [sortedAlerts, defaultOpenCritical]);

  return (
    <div className="alerts-card__drawer">
      {alertsQuantity > 0 ? (
        <Accordion asDefinitionList isBordered>
          <AccordionItem isExpanded={titleOpen}>
            <AccordionToggle
              className="alerts-card__toggle--main"
              id="toggle-main"
              onClick={() => {
                setTitleOpen((title) => {
                  title && setAlertTypeOpen(null);
                  return !title;
                });
              }}
            >
              <Flex>
                {Object.keys(sortedAlerts)?.map((alertType) => {
                  const numAlerts = sortedAlerts?.[alertType as AlertType]?.length;
                  // // Don't show alerts in the drawer header if there are no alerts of the type
                  if (numAlerts === 0) {
                    return null;
                  }
                  return (
                    <Button
                      className="pf-m-link--align-left"
                      key={alertType}
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
                      variant={ButtonVariant.plain}
                    >
                      <Label
                        className="alerts-label"
                        key={alertType}
                        status={labelStatus[alertType]}
                      >
                        {numAlerts ?? 0}
                      </Label>
                      <span className="alerts-label--text">{labelText[alertType]}</span>
                    </Button>
                  );
                })}
              </Flex>
            </AccordionToggle>
            {titleOpen && (
              <AccordionContent id="toggle-main">
                <Accordion asDefinitionList isBordered>
                  {Object.entries(sortedAlerts)?.map(([alertType, alerts]) => (
                    <AlertsCardAccordionItem
                      alertOpen={alertTypeOpen}
                      alerts={alerts}
                      alertType={alertType as AlertType}
                      handleDrawerToggleClick={handleDrawerToggleClick}
                      key={alertType}
                    />
                  ))}
                </Accordion>
              </AccordionContent>
            )}
          </AccordionItem>
        </Accordion>
      ) : null}
    </div>
  );
};

export default AlertsDrawer;
