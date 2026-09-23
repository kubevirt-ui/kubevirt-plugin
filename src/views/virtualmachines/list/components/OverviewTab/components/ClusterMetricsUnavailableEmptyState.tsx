import type { FC } from 'react';

import {
  getClusterMetricsUnavailableMessage,
  getClusterMetricsUnavailableTitle,
} from '@kubevirt-utils/errors/clusterMetricsAccess';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoDataAvailableMessage } from '@kubevirt-utils/utils/utils';
import {
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';

type ClusterMetricsUnavailableEmptyStateProps = {
  metricsForbidden?: boolean;
};

const ClusterMetricsUnavailableEmptyState: FC<ClusterMetricsUnavailableEmptyStateProps> = ({
  metricsForbidden = false,
}) => {
  const { t } = useKubevirtTranslation();
  const bodyMessage = metricsForbidden
    ? getClusterMetricsUnavailableMessage(t)
    : getNoDataAvailableMessage(t);

  return (
    <Card data-test="cluster-metrics-unavailable" isCompact>
      <CardBody className="pf-v6-u-pb-lg">
        <EmptyState
          headingLevel="h3"
          titleText={getClusterMetricsUnavailableTitle(t)}
          variant={EmptyStateVariant.sm}
        >
          <EmptyStateBody>{bodyMessage}</EmptyStateBody>
        </EmptyState>
      </CardBody>
    </Card>
  );
};

export default ClusterMetricsUnavailableEmptyState;
