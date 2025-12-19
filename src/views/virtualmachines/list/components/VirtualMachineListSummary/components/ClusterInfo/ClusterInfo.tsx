import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Card, CardBody, Flex } from '@patternfly/react-core';
import {
  getClustersWithVMsCount,
  getNamespacesWithVMsCount,
} from '@virtualmachines/list/utils/utils';

import ResourceCount from './ResourceCount';
import ResourceTitle from './ResourceTitle';

type ClusterInfoProps = {
  vms: V1VirtualMachine[];
};

const ClusterInfo: FC<ClusterInfoProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();

  const isAllClustersPage = useIsAllClustersPage();
  const isACMPage = useIsACMPage();

  const cluster = useClusterParam();
  const namespace = useNamespaceParam();

  const clustersWithVMsCount = useMemo(() => getClustersWithVMsCount(vms), [vms]);
  const namespacesWithVMsCount = useMemo(
    () => getNamespacesWithVMsCount(vms, isAllClustersPage),
    [vms, isAllClustersPage],
  );

  const clusterTitle = <ResourceTitle name={cluster} title={t('Cluster')} />;
  const projectTitle = <ResourceTitle name={namespace} title={t('Project')} />;
  const namespacesCountElement = (
    <ResourceCount
      count={namespacesWithVMsCount}
      label={namespacesWithVMsCount === 1 ? t('Project') : t('Projects')}
    />
  );

  return (
    <Card>
      <CardBody>
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
          {isAllClustersPage && (
            <>
              <ResourceTitle title={t('All clusters')} />
              <ResourceCount
                count={clustersWithVMsCount}
                label={clustersWithVMsCount === 1 ? t('Cluster') : t('Clusters')}
              />
              {namespacesCountElement}
            </>
          )}
          {cluster && !namespace && (
            <>
              {clusterTitle}
              {namespacesCountElement}
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
              {namespacesCountElement}
            </>
          )}
          {!isACMPage && namespace && projectTitle}
        </Flex>
      </CardBody>
    </Card>
  );
};

export default ClusterInfo;
