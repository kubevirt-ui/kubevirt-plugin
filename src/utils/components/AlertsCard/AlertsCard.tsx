import React from 'react';
import { Link } from 'react-router-dom';
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
import {
  Card,
  CardActions,
  CardHeader,
  CardTitle,
  Popover,
  PopoverPosition,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';

import './AlertsCard.scss';

type AlertsCardProps = {
  sortedAlerts: SimplifiedAlerts;
  isOverviewPage?: boolean;
  className?: string;
};

const AlertsCard: React.FC<AlertsCardProps> = ({
  sortedAlerts,
  isOverviewPage = false,
  className,
}) => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const [alertScope, setAlertScope] = useLocalStorage(
    ALERTS_SCOPE_KEY,
    isAdmin ? VIRTUALIZATION_ONLY_ALERTS : ALL_ALERTS,
  );

  const alerts = React.useMemo(() => {
    return !isOverviewPage || !isAdmin || alertScope === ALL_ALERTS
      ? sortedAlerts
      : removeVMAlerts(sortedAlerts);
  }, [alertScope, isAdmin, isOverviewPage, sortedAlerts]);

  const alertsQuantity =
    Object.values(sortedAlerts)?.reduce((acc, category) => acc + category?.length, 0) || 0;

  return (
    <Card className={classNames('alerts-card', className)}>
      <CardHeader className="alerts-card__header">
        <CardTitle className="text-muted card-title">
          {t('Alerts ({{alertsQuantity}})', { alertsQuantity })}
        </CardTitle>
        {isOverviewPage && (
          <CardActions className="co-overview-card__actions alerts-card__actions">
            {isAdmin && (
              <Link className="alerts-card__view-all-link" to={VIEW_ALL_ALERTS_PATH}>
                {t('View all')}
              </Link>
            )}
            {isAdmin ? (
              <FormPFSelect
                toggleId="overview-alerts-card"
                variant={SelectVariant.single}
                selections={alertScope}
                onSelect={(e, value) => setAlertScope(value)}
                isDisabled={!isAdmin}
              >
                {alertScopeOptions().map((scope) => (
                  <SelectOption
                    key={scope.key}
                    value={scope.value}
                    description={scope.description}
                  />
                ))}
              </FormPFSelect>
            ) : (
              <Popover
                className="alerts-card__nonadmin-popover"
                aria-label="Only VM-related alerts notification"
                position={PopoverPosition.top}
                enableFlip={false}
                hasAutoWidth
                maxWidth="250px"
                bodyContent={<div>{t('Only VM-related alerts in your project will be shown')}</div>}
              >
                <FormPFSelect
                  toggleId="overview-alerts-card"
                  variant={SelectVariant.single}
                  selections={alertScope}
                  onSelect={(e, value) => setAlertScope(value)}
                  isDisabled={!isAdmin}
                >
                  {alertScopeOptions().map((scope) => (
                    <SelectOption
                      key={scope.key}
                      value={scope.value}
                      description={scope.description}
                    />
                  ))}
                </FormPFSelect>
              </Popover>
            )}
          </CardActions>
        )}
      </CardHeader>
      <AlertsDrawer sortedAlerts={alerts} />
    </Card>
  );
};

export default AlertsCard;
