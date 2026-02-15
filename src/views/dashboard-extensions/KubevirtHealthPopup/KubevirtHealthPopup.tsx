import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { AlertType } from '@kubevirt-utils/components/AlertsCard/utils/types';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { getAlertsPath } from '@kubevirt-utils/constants/prometheus';
import useInfrastructureAlerts from '@kubevirt-utils/hooks/useInfrastructureAlerts/useInfrastructureAlerts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  useActivePerspective,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { Divider, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';

import Conditions from './components/Conditions/Conditions';
import HealthPopupChart from './components/HealthPopupChart';
import { HealthImpactLevel } from './utils/types';
import { HEALTH_ALERTS_URL_PARAMS } from './utils/utils';

import './KubevirtHealthPopup.scss';

const KubevirtHealthPopup: FC = () => {
  const { t } = useKubevirtTranslation();
  const { alerts, loaded, numberOfAlerts } = useInfrastructureAlerts();
  const [perspective] = useActivePerspective();

  const descriptionText = t(
    'You can host and manage virtualized workloads on the same platform as container-based workloads.',
  );

  const numCriticalAlerts = alerts?.[HealthImpactLevel.critical]?.length;
  const numWarningAlerts = alerts?.[AlertType.warning]?.length;
  const healthAlertsURLBasePath = getAlertsPath(perspective, null, HEALTH_ALERTS_URL_PARAMS);

  return (
    <>
      <Grid className="kv-health-popup">
        <GridItem className="kv-health-popup__description" span={12}>
          {descriptionText}
        </GridItem>
        <GridItem span={6}>
          <Stack>
            <StackItem>
              <div className="kv-health-popup__title">{t('Alerts')}</div>
            </StackItem>
            {!isEmpty(numCriticalAlerts) && (
              <StackItem>
                <div className="kv-health-popup__alerts-count">
                  <RedExclamationCircleIcon className="kv-health-popup__alerts-count--icon" />
                  <Link to={`${healthAlertsURLBasePath}${HealthImpactLevel.critical}`}>
                    {numCriticalAlerts} {t('Critical')}
                  </Link>
                </div>
              </StackItem>
            )}
            {!isEmpty(numWarningAlerts) && (
              <StackItem>
                <div className="kv-health-popup__alerts-count">
                  <YellowExclamationTriangleIcon className="kv-health-popup__alerts-count--icon" />{' '}
                  <Link to={`${healthAlertsURLBasePath}${HealthImpactLevel.warning}`}>
                    {numWarningAlerts} {t('Warning')}
                  </Link>
                </div>
              </StackItem>
            )}
          </Stack>
        </GridItem>
        <GridItem span={6}>
          {loaded ? (
            <HealthPopupChart alerts={alerts} numberOfAlerts={numberOfAlerts} />
          ) : (
            <LoadingEmptyState />
          )}
        </GridItem>
      </Grid>

      <Divider className="kv-health-popup__divider" />
      <Conditions />
    </>
  );
};

export default KubevirtHealthPopup;
