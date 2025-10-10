import { FC, useCallback, useEffect } from 'react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_CLUSTERS_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Skeleton } from '@patternfly/react-core';
import { useFleetClusterNames, useHubClusterName } from '@stolostron/multicluster-sdk';

import InlineFilterSelect from '../FilterSelect/InlineFilterSelect';
import ProjectDropdown from '../ProjectDropdown/ProjectDropdown';

import { SKELETON_HEIGHT, SKELETON_WIDTH } from './constants';
import { getClusterOptions } from './utils';

import './ClusterProjectDropdown.scss';

type ClusterProjectDropdownProps = {
  includeAllClusters?: boolean;
  includeAllProjects?: boolean;
  showProjectDropdown?: boolean;
};

const ClusterProjectDropdown: FC<ClusterProjectDropdownProps> = ({
  includeAllClusters,
  includeAllProjects,
  showProjectDropdown = true,
}) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const cluster = useClusterParam();
  const namespace = useNamespaceParam();
  const navigate = useNavigate();
  const location = useLocation();
  const [hubClusterName, hubClusterNameLoaded] = useHubClusterName();
  const [projects, projectLoaded] = useProjects(cluster || hubClusterName);

  const [clusterNames, clustersLoaded] = useFleetClusterNames();

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
    if (
      !includeAllProjects &&
      cluster &&
      isEmpty(namespace) &&
      projectLoaded &&
      showProjectDropdown
    ) {
      const defaultProject = projects.find((project) => project === DEFAULT_NAMESPACE);
      onProjectChange(defaultProject || projects?.[0]);
    }
  }, [cluster, includeAllProjects, namespace, onProjectChange, projectLoaded, projects]);

  if (!isACMPage) {
    return null;
  }

  return (
    <div className="cluster-project-dropdown">
      {t('Clusters')}:
      <div className="cluster-dropdown">
        {clustersLoaded ? (
          <InlineFilterSelect
            options={getClusterOptions(includeAllClusters, clusterNames)}
            selected={cluster || ALL_CLUSTERS_KEY}
            setSelected={onClusterChange}
            toggleProps={{ isFullWidth: true }}
          />
        ) : (
          <Skeleton height={SKELETON_HEIGHT} width={SKELETON_WIDTH} />
        )}
      </div>
      {showProjectDropdown && (
        <>
          {t('Projects')}:
          <div className="project-dropdown">
            {projectLoaded ? (
              <ProjectDropdown
                cluster={cluster}
                includeAllProjects={includeAllProjects}
                isDisabled={!cluster}
                onChange={onProjectChange}
                selectedProject={namespace}
              />
            ) : (
              <Skeleton height={SKELETON_HEIGHT} width={SKELETON_WIDTH} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ClusterProjectDropdown;
