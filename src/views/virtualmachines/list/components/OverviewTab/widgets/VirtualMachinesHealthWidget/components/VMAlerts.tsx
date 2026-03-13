import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  BlueInfoCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Card, CardBody, CardHeader, CardTitle, Grid } from '@patternfly/react-core';

import StatusCountItem from '../../shared/StatusCountItem';
import ViewAllLink from '../../shared/ViewAllLink';
import useVMAlerts from '../hooks/useVMAlerts';

import './health-card.scss';
import './VMAlerts.scss';

type VMAlertsProps = {
  onViewAll?: () => void;
};

const VMAlerts: FC<VMAlertsProps> = ({ onViewAll }) => {
  const { t } = useKubevirtTranslation();
  const { critical, error, info, loaded, warning } = useVMAlerts();
  const totalAlerts = critical + warning + info;
  const isLoading = !loaded;

  return (
    <Card className="vm-alerts health-card" data-test="vm-alerts-widget" isCompact>
      <CardHeader
        actions={
          onViewAll
            ? {
                actions: <ViewAllLink onClick={onViewAll} />,
                hasNoOffset: false,
              }
            : undefined
        }
        className="health-card__header"
      >
        <CardTitle>
          {t('Virtual machine alerts')}
          {loaded && !error && <span className="vm-alerts__count">{totalAlerts}</span>}
        </CardTitle>
      </CardHeader>
      <CardBody>
        {error ? (
          <Alert isInline isPlain title={t('Failed to load alerts')} variant="danger" />
        ) : (
          <Grid hasGutter>
            <StatusCountItem
              count={critical}
              icon={<RedExclamationCircleIcon />}
              isLoading={isLoading}
              label={t('Critical')}
            />
            <StatusCountItem
              count={warning}
              icon={<YellowExclamationTriangleIcon />}
              isLoading={isLoading}
              label={t('Warning')}
            />
            <StatusCountItem
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
