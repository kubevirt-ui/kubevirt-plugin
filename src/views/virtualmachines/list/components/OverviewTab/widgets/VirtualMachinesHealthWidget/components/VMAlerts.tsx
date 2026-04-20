import React, { FCC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, Flex } from '@patternfly/react-core';

import useVMAlerts from '../hooks/useVMAlerts';
import { getSeverityUrls, VMAlertsProps } from '../utils/vmAlerts';

import TotalAlertCount from './TotalAlertCount';
import VMAlertsCard from './VMAlertsCard';
import VMAlertSeverityCounts from './VMAlertSeverityCounts';

const VMAlerts: FCC<VMAlertsProps> = ({ alertsBaseHref, alertsBasePath, vmNames }) => {
  const { t } = useKubevirtTranslation();
  const { critical, error, info, loaded, warning } = useVMAlerts(vmNames);
  const totalAlerts = critical + warning + info;
  const isLoading = !loaded;

  const isExternal = !alertsBasePath && !!alertsBaseHref;
  const baseUrl = alertsBasePath || alertsBaseHref;

  const severityUrls = useMemo(() => getSeverityUrls(baseUrl), [baseUrl]);

  return (
    <VMAlertsCard
      titleExtra={
        <TotalAlertCount
          alertsBaseHref={alertsBaseHref}
          alertsBasePath={alertsBasePath}
          hasError={!!error}
          loaded={loaded}
          totalAlerts={totalAlerts}
        />
      }
      alertsBaseHref={alertsBaseHref}
      alertsBasePath={alertsBasePath}
    >
      {error ? (
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          className="vm-alerts__error"
          justifyContent={{ default: 'justifyContentCenter' }}
        >
          <Alert isInline isPlain title={t('Failed to load alerts')} variant="danger" />
        </Flex>
      ) : (
        <VMAlertSeverityCounts
          critical={critical}
          info={info}
          isExternal={isExternal}
          isLoading={isLoading}
          severityUrls={severityUrls}
          warning={warning}
        />
      )}
    </VMAlertsCard>
  );
};

export default VMAlerts;
