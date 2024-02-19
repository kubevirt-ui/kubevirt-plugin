import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import AlertsDrawer from '@kubevirt-utils/components/AlertsCard/AlertsDrawer';
import {
  ALERTS_SCOPE_KEY,
  ALL_ALERTS,
  VIEW_ALL_ALERTS_PATH,
  VIRTUALIZATION_ONLY_ALERTS,
} from '@kubevirt-utils/components/AlertsCard/utils/constants';
import { SimplifiedAlerts } from '@kubevirt-utils/components/AlertsCard/utils/types';
import {
  alertScopeOptions,
  removeVMAlerts,
} from '@kubevirt-utils/components/AlertsCard/utils/utils';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { Card, CardHeader, CardTitle, Popover, PopoverPosition } from '@patternfly/react-core';
import { SelectOption } from '@patternfly/react-core';

import './AlertsCard.scss';

type AlertsCardProps = {
  className?: string;
  isOverviewPage?: boolean;
  sortedAlerts: SimplifiedAlerts;
};

const AlertsCard: FC<AlertsCardProps> = ({ className, isOverviewPage = false, sortedAlerts }) => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const [alertScope, setAlertScope] = useLocalStorage(
    ALERTS_SCOPE_KEY,
    isAdmin ? VIRTUALIZATION_ONLY_ALERTS : ALL_ALERTS, // for admins show the number of virtualization health alerts by default
  );

  const alerts = useMemo(() => {
    return !isOverviewPage || !isAdmin || alertScope === ALL_ALERTS
      ? sortedAlerts
      : removeVMAlerts(sortedAlerts);
  }, [alertScope, isAdmin, isOverviewPage, sortedAlerts]);

  // number of alerts according to the selected scope: Virtualization health only or all alerts
  const alertsQuantity =
    Object.values(alerts)?.reduce((acc, category) => acc + category?.length, 0) || 0;

  return (
    <Card className={classNames('alerts-card', className)}>
      <CardHeader
        {...(isOverviewPage && {
          actions: {
            actions: (
              <>
                {isAdmin && (
                  <Link className="alerts-card__view-all-link" to={VIEW_ALL_ALERTS_PATH}>
                    {t('View all')}
                  </Link>
                )}
                {isAdmin ? (
                  <FormPFSelect
                    onSelect={(e, value) => setAlertScope(value)}
                    popperProps={{ position: 'right' }}
                    selected={alertScope}
                    toggleProps={{ id: 'overview-alerts-card' }}
                  >
                    {alertScopeOptions().map((scope) => (
                      <SelectOption
                        description={scope.description}
                        key={scope.key}
                        value={scope.value}
                      >
                        {scope.value}
                      </SelectOption>
                    ))}
                  </FormPFSelect>
                ) : (
                  <Popover
                    bodyContent={
                      <div>{t('Only VM-related alerts in your project will be shown')}</div>
                    }
                    aria-label="Only VM-related alerts notification"
                    className="alerts-card__nonadmin-popover"
                    enableFlip={false}
                    hasAutoWidth
                    maxWidth="250px"
                    position={PopoverPosition.top}
                  >
                    <FormPFSelect
                      onSelect={(e, value) => setAlertScope(value)}
                      selected={alertScope}
                      toggleProps={{ id: 'overview-alerts-card' }}
                    >
                      {alertScopeOptions().map((scope) => (
                        <SelectOption
                          description={scope.description}
                          key={scope.key}
                          value={scope.value}
                        >
                          {scope.value}
                        </SelectOption>
                      ))}
                    </FormPFSelect>
                  </Popover>
                )}
              </>
            ),
            className: 'co-overview-card__actions alerts-card__actions',
            hasNoOffset: false,
          },
        })}
        className="alerts-card__header"
      >
        <CardTitle className="text-muted card-title">
          {t('Alerts ({{alertsQuantity}})', { alertsQuantity })}
        </CardTitle>
      </CardHeader>
      <AlertsDrawer sortedAlerts={alerts} />
    </Card>
  );
};

export default AlertsCard;
