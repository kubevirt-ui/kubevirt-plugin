import React, { FC } from 'react';

import { AlertType } from '@kubevirt-utils/components/AlertsCard/utils/types';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import useInfrastructureAlerts from '@kubevirt-utils/hooks/useInfrastructureAlerts/useInfrastructureAlerts';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';

import EmptyStateNoAlerts from './components/EmptyStateNoAlerts';
import HealthPopupChart from './components/HealthPopupChart';
import { HealthImpactLevel } from './utils/types';
import { ALERTS_BASE_PATH } from './utils/utils';

import './KubevirtHealthPopup.scss';

const KubevirtHealthPopup: FC = () => {
  const { alerts, loaded, numberOfAlerts } = useInfrastructureAlerts();
  const descriptionText = t(
    'You can host and manage virtualized workloads on the same platform as container-based workloads.',
  );

  return (
    <Grid className="kv-health-popup">
      <GridItem className="kv-health-popup__description" span={12}>
        {descriptionText}
      </GridItem>
      <GridItem span={4}>
        <Stack>
          <StackItem>
            <div className="kv-health-popup__alerts-title">Alerts</div>
          </StackItem>
          <StackItem>
            <div className="kv-health-popup__alerts-count">
              <RedExclamationCircleIcon className="kv-health-popup__alerts-count--icon" />
              <a href={`${ALERTS_BASE_PATH}${HealthImpactLevel.critical}`}>
                {`${alerts?.[HealthImpactLevel.critical]?.length} Critical`}
              </a>
            </div>
          </StackItem>
          <StackItem>
            <div className="kv-health-popup__alerts-count">
              <YellowExclamationTriangleIcon className="kv-health-popup__alerts-count--icon" />{' '}
              <a href={`${ALERTS_BASE_PATH}${HealthImpactLevel.warning}`}>
                {`${alerts?.[AlertType.warning]?.length} Warning`}
              </a>
            </div>
          </StackItem>
        </Stack>
      </GridItem>
      <GridItem span={8}>
        {!loaded && <LoadingEmptyState />}
        {loaded && numberOfAlerts > 0 ? (
          <HealthPopupChart alerts={alerts} />
        ) : (
          <EmptyStateNoAlerts classname="kv-health-popup__empty-state--no-alerts" />
        )}
      </GridItem>
    </Grid>
  );
};

export default KubevirtHealthPopup;
