import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { AlertType } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  BlueInfoCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';

import useAlerts from '../../clusteroverview/OverviewTab/alerts-card/hooks/useAlerts';

import HealthPopupChart from './components/HealthPopupChart';
import { ALERTS_BASE_PATH } from './utils/utils';

import './KubevirtHealthPopup.scss';

const KubevirtHealthPopup: FC = () => {
  const alerts = useAlerts();
  const descriptionText = t(
    'You can host and manage virtualized workloads on the same platform as container-based workloads.',
  );

  return (
    <Grid className="kv-health-popup">
      <GridItem span={12} className="kv-health-popup__description">
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
              <Link to={`${ALERTS_BASE_PATH}${AlertType.critical}`}>{`${
                alerts?.[AlertType.critical]?.length
              } Critical`}</Link>
            </div>
          </StackItem>
          <StackItem>
            <div className="kv-health-popup__alerts-count">
              <YellowExclamationTriangleIcon className="kv-health-popup__alerts-count--icon" />{' '}
              <Link to={`${ALERTS_BASE_PATH}${AlertType.warning}`}>{`${
                alerts?.[AlertType.warning]?.length
              } Warning`}</Link>
            </div>
          </StackItem>
          <StackItem>
            <div className="kv-health-popup__alerts-count">
              <BlueInfoCircleIcon className="kv-health-popup__alerts-count--icon" />{' '}
              <Link to={`${ALERTS_BASE_PATH}${AlertType.info}`}>{`${
                alerts?.[AlertType.info]?.length
              } Info`}</Link>
            </div>
          </StackItem>
        </Stack>
      </GridItem>
      <GridItem span={8}>
        <HealthPopupChart alerts={alerts} />
      </GridItem>
    </Grid>
  );
};

export default KubevirtHealthPopup;
