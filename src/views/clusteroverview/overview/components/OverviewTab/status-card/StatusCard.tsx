import * as React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DashboardsOverviewHealthSubsystem as DynamicDashboardsOverviewHealthSubsystem,
  isDashboardsOverviewHealthSubsystem as isDynamicDashboardsOverviewHealthSubsystem,
  isResolvedDashboardsOverviewHealthURLSubsystem,
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { HealthBody } from '@openshift-console/dynamic-plugin-sdk-internal';
import {
  Card,
  CardActions,
  CardHeader,
  CardTitle,
  Gallery,
  GalleryItem,
} from '@patternfly/react-core';

import { VIRTUALIZATION } from './utils/constants';
import useDashboardSubsystems from './utils/hooks/useDashboardSubsystems';
import NetworkingHealthItem from './utils/NetworkingHealthItem';
import StorageHealthItem from './utils/storage-health-item/StorageHealthItem';
import { VirtStatusItems } from './utils/types';
import URLHealthItem from './utils/URLHealthItem';
import { getClusterNAC, NetworkAddonsConfigResource } from './utils/utils';
import VirtualizationAlerts from './utils/VirtualizationAlerts';

const StatusCard = () => {
  const { t } = useKubevirtTranslation();
  const subsystems = useDashboardSubsystems<DynamicDashboardsOverviewHealthSubsystem>(
    isDynamicDashboardsOverviewHealthSubsystem,
  );

  const [networkAddonsConfigList] = useK8sWatchResource<K8sResourceCommon[]>(
    NetworkAddonsConfigResource,
  );
  const clusterNAC = getClusterNAC(networkAddonsConfigList);

  const virtStatusItems: VirtStatusItems = [];
  subsystems?.forEach((subsystem) => {
    if (
      isResolvedDashboardsOverviewHealthURLSubsystem(subsystem) &&
      subsystem?.properties?.title === VIRTUALIZATION
    ) {
      virtStatusItems.push({
        title: t('Virtualization'),
        Component: <URLHealthItem subsystem={subsystem.properties} />,
      });
    }
  });

  virtStatusItems.push({
    title: t('Networking'),
    Component: <NetworkingHealthItem nac={clusterNAC} />,
  });

  virtStatusItems.push({
    title: t('Storage'),
    Component: <StorageHealthItem />,
  });

  return (
    <Card className="co-overview-card--gradient" data-test-id="kv-overview-status-card">
      <CardHeader>
        <CardTitle>{t('Status')}</CardTitle>
        <CardActions className="co-overview-card__actions">
          <Link to="/monitoring/alerts">{t('View alerts')}</Link>
        </CardActions>
      </CardHeader>
      <HealthBody>
        <Gallery className="co-overview-status__health" hasGutter>
          {virtStatusItems?.map((item) => {
            return <GalleryItem key={item.title}>{item.Component}</GalleryItem>;
          })}
        </Gallery>
      </HealthBody>
      <VirtualizationAlerts />
    </Card>
  );
};

export default StatusCard;
