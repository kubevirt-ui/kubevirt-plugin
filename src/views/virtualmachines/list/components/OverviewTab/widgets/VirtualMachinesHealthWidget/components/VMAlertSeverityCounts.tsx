import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  BlueInfoCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Grid } from '@patternfly/react-core';

import StatusCountItem, { getLinkProps } from '../../shared/StatusCountItem';
import { SeverityUrls } from '../utils/vmAlerts';

type VMAlertSeverityCountsProps = {
  critical: number;
  info: number;
  isExternal: boolean;
  isLoading: boolean;
  severityUrls: SeverityUrls;
  warning: number;
};

const VMAlertSeverityCounts: FCC<VMAlertSeverityCountsProps> = ({
  critical,
  info,
  isExternal,
  isLoading,
  severityUrls,
  warning,
}) => {
  const { t } = useKubevirtTranslation();

  return (
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
  );
};

export default VMAlertSeverityCounts;
