import { FC, useCallback, useEffect } from 'react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_CLUSTERS_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useAllClusters from '@multicluster/hooks/useAllClusters/useAllClusters';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Spinner } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import InlineFilterSelect from '../FilterSelect/InlineFilterSelect';
import ProjectDropdown from '../ProjectDropdown/ProjectDropdown';

import { getClusterOptions } from './utils';

import './ClusterProjectDropdown.scss';

type ClusterProjectDropdownProps = {
  includeAllClusters?: boolean;
  includeAllProjects?: boolean;
};

const ClusterProjectDropdown: FC<ClusterProjectDropdownProps> = ({
  includeAllClusters,
  includeAllProjects,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const namespace = useNamespaceParam();
  const navigate = useNavigate();
  const location = useLocation();
  const [hubClusterName, hubClusterNameLoaded] = useHubClusterName();
  const [projects, projectLoaded] = useProjects(cluster || hubClusterName);

  const [clusters, clustersLoaded] = useAllClusters();

  const onClusterChange = useCallback(
    (newCluster: string) => {
      const clusterReplaceKey =
        newCluster === ALL_CLUSTERS_KEY ? '/all-clusters/' : `/cluster/${newCluster}/`;
      const newPathname = location.pathname
        .replace(`/cluster/${cluster}/`, clusterReplaceKey)
        .replace('/all-clusters/', clusterReplaceKey);
      navigate(newPathname);
    },
    [location.pathname, cluster, navigate],
  );

  const onProjectChange = useCallback(
    (newProject: string) => {
      const projectReplaceKey =
        newProject === ALL_PROJECTS ? '/all-namespaces/' : `/ns/${newProject}/`;
      const newPathname = location.pathname
        .replace(`/ns/${namespace}/`, projectReplaceKey)
        .replace('/all-namespaces/', projectReplaceKey);
      navigate(newPathname);
    },
    [location.pathname, namespace, navigate],
  );

  useEffect(() => {
    if (!includeAllClusters && isEmpty(cluster) && hubClusterNameLoaded) {
      onClusterChange(hubClusterName);
    }
  }, [cluster, hubClusterName, hubClusterNameLoaded, includeAllClusters, onClusterChange]);

  useEffect(() => {
    if (!includeAllProjects && cluster && isEmpty(namespace) && projectLoaded) {
      const defaultProject = projects.find((project) => project === DEFAULT_NAMESPACE);
      onProjectChange(defaultProject || projects?.[0]);
    }
  }, [cluster, includeAllProjects, namespace, onProjectChange, projectLoaded, projects]);

  if (
    !location.pathname.startsWith('/k8s/cluster/') &&
    !location.pathname.startsWith('/k8s/all-clusters')
  ) {
    return null;
  }

  return (
    <div className="cluster-project-dropdown">
      {t('Clusters')}:
      <div className="cluster-dropdown">
        {clustersLoaded ? (
          <InlineFilterSelect
            options={getClusterOptions(includeAllClusters, clusters)}
            selected={cluster || ALL_CLUSTERS_KEY}
            setSelected={onClusterChange}
            toggleProps={{ isFullWidth: true }}
          />
        ) : (
          <Spinner size="sm" />
        )}
      </div>
      {t('Projects')}:
      <div className="project-dropdown">
        {projectLoaded ? (
          <ProjectDropdown
            cluster={cluster}
            includeAllProjects={includeAllProjects}
            onChange={onProjectChange}
            selectedProject={namespace}
          />
        ) : (
          <Spinner size="sm" />
        )}
      </div>
    </div>
  );
};

export default ClusterProjectDropdown;
