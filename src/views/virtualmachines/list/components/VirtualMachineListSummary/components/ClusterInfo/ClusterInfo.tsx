import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useAllCurrentClusters from '@kubevirt-utils/hooks/useAllCurrentClusters';
import useAllCurrentNamespaces from '@kubevirt-utils/hooks/useAllCurrentNamespaces';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Card, CardBody, Flex } from '@patternfly/react-core';

import ResourceCount from './ResourceCount';
import ResourceTitle from './ResourceTitle';

type ClusterInfoProps = {
  vms: V1VirtualMachine[];
};

const ClusterInfo: FC<ClusterInfoProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();

  const isAllClustersPage = useIsAllClustersPage();
  const isACMPage = useIsACMPage();

  const clusters = useAllCurrentClusters();
  const namespaces = useAllCurrentNamespaces(clusters);

  const cluster = useClusterParam();
  const namespace = useNamespaceParam();

  const clusterTitle = <ResourceTitle name={cluster} title={t('Cluster')} />;
  const projectTitle = <ResourceTitle name={namespace} title={t('Project')} />;
  const namespacesCount = <ResourceCount count={namespaces.length} label={t('Projects')} />;

  return (
    <Card>
      <CardBody>
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
          {isAllClustersPage && (
            <>
              <ResourceTitle title={t('All clusters')} />
              <ResourceCount count={clusters.length} label={t('Clusters')} />
              {namespacesCount}
            </>
          )}
          {cluster && !namespace && (
            <>
              {clusterTitle}
              {namespacesCount}
            </>
          )}
          {cluster && namespace && (
            <>
              {clusterTitle}
              {projectTitle}
            </>
          )}
          {!isACMPage && !namespace && (
            <>
              <ResourceTitle title={t('All projects')} />
              {namespacesCount}
            </>
          )}
          {!isACMPage && namespace && projectTitle}
          <ResourceCount count={vms.length} label={t('Virtual Machines')} />
        </Flex>
      </CardBody>
    </Card>
  );
};

export default ClusterInfo;
