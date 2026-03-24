import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  BlueInfoCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Card, CardBody, CardHeader, CardTitle, Grid } from '@patternfly/react-core';

import StatusCountItem, { getLinkProps } from '../../shared/StatusCountItem';
import ViewAllLink from '../../shared/ViewAllLink';
import useVMAlerts from '../hooks/useVMAlerts';
import { getSeverityUrls, VMAlertsProps } from '../utils/vmAlerts';

import TotalAlertCount from './TotalAlertCount';

import './health-card.scss';
import './VMAlerts.scss';

const VMAlerts: FC<VMAlertsProps> = ({ alertsBaseHref, alertsBasePath }) => {
  const { t } = useKubevirtTranslation();
  const { critical, error, info, loaded, warning } = useVMAlerts();
  const totalAlerts = critical + warning + info;
  const isLoading = !loaded;

  const isExternal = !alertsBasePath && !!alertsBaseHref;
  const baseUrl = alertsBasePath || alertsBaseHref;

  const severityUrls = useMemo(() => getSeverityUrls(baseUrl), [baseUrl]);

  return (
    <Card className="vm-alerts health-card" data-test="vm-alerts-widget" isCompact>
      <CardHeader
        actions={
          baseUrl
            ? {
                actions: <ViewAllLink href={alertsBaseHref} linkPath={alertsBasePath} />,
                hasNoOffset: false,
              }
            : undefined
        }
        className="health-card__header"
      >
        <CardTitle>
          {t('Virtual machine alerts')}
          <TotalAlertCount
            alertsBaseHref={alertsBaseHref}
            alertsBasePath={alertsBasePath}
            hasError={!!error}
            loaded={loaded}
            totalAlerts={totalAlerts}
          />
        </CardTitle>
      </CardHeader>
      <CardBody>
        {error ? (
          <Alert isInline isPlain title={t('Failed to load alerts')} variant="danger" />
        ) : (
          <Grid className="status-count-grid" hasGutter>
            <StatusCountItem
              {...getLinkProps(severityUrls.critical, isExternal)}
              count={critical}
              icon={<RedExclamationCircleIcon />}
              isLoading={isLoading}
              label={t('Critical')}
            />
            <StatusCountItem
              {...getLinkProps(severityUrls.warning, isExternal)}
              count={warning}
              icon={<YellowExclamationTriangleIcon />}
              isLoading={isLoading}
              label={t('Warning')}
            />
            <StatusCountItem
              {...getLinkProps(severityUrls.info, isExternal)}
              count={info}
              icon={<BlueInfoCircleIcon />}
              isLoading={isLoading}
              label={t('Info')}
            />
          </Grid>
        )}
      </CardBody>
    </Card>
  );
};

export default VMAlerts;
