import React, { FC, JSX, memo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import ClusterDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown';
import NamespaceDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/NamespaceDropdown';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_CLUSTERS_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import './ClusterProjectDropdown.scss';

type ClusterProjectDropdownProps = {
  includeAllClusters?: boolean;
  includeAllProjects?: boolean;
  showClusterDropdown?: boolean;
  showProjectDropdown?: boolean;
};

const ClusterProjectDropdown: FC<ClusterProjectDropdownProps> = memo(
  ({
    includeAllClusters = true,
    includeAllProjects,
    showClusterDropdown = true,
    showProjectDropdown = true,
  }): JSX.Element | null => {
    const { t } = useKubevirtTranslation();
    const isACMPage = useIsACMPage();
    const cluster = useActiveClusterParam();
    const selectedCluster = useClusterParam();
    const namespace = useNamespaceParam();
    const navigate = useNavigate();
    const location = useLocation();
    const [hubClusterName, hubClusterNameLoaded] = useHubClusterName();
    const [projects, projectLoaded] = useProjects(cluster || hubClusterName);

    const onClusterChange = useCallback(
      (newCluster: string) => {
        const clusterReplaceKey =
          newCluster === ALL_CLUSTERS_KEY ? '/all-clusters/' : `/cluster/${newCluster}/`;
        let newPathname = location.pathname
          .replace(`/cluster/${cluster}/`, clusterReplaceKey)
          .replace('/all-clusters/', clusterReplaceKey);

        // Reset project to "all projects" when cluster changes
        if (namespace) {
          newPathname = newPathname.replace(`/ns/${namespace}/`, '/all-namespaces/');
        }

        navigate(newPathname);
      },
      [location.pathname, cluster, namespace, navigate],
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
      if (!isACMPage) return;
      if (includeAllClusters) return;

      if (isEmpty(selectedCluster) && hubClusterNameLoaded) {
        onClusterChange(hubClusterName);
      }
    }, [cluster, hubClusterName, hubClusterNameLoaded, includeAllClusters, onClusterChange]);

    useEffect(() => {
      if (!isACMPage) return;
      if (includeAllProjects) return;

      if (cluster && isEmpty(namespace) && projectLoaded && showProjectDropdown) {
        const defaultProject = projects?.find((project) => project === DEFAULT_NAMESPACE);
        const selectedProject = defaultProject || projects?.[0] || ALL_PROJECTS;
        if (selectedProject) {
          onProjectChange(selectedProject);
        }
      }
    }, [
      cluster,
      includeAllProjects,
      namespace,
      onProjectChange,
      projectLoaded,
      projects,
      showProjectDropdown,
    ]);

    if (!isACMPage) {
      return null;
    }

    return (
      <div className="cluster-project-dropdown">
        {showClusterDropdown && (
          <div className="cluster-project-dropdown__cluster">
            {t('Cluster')}:
            <ClusterDropdown
              bookmarkCluster={hubClusterName}
              includeAllClusters={includeAllClusters}
              onChange={onClusterChange}
              selectedCluster={cluster || ALL_CLUSTERS_KEY}
            />
          </div>
        )}
        {showProjectDropdown && (
          <div className="cluster-project-dropdown__project">
            {t('Project')}:
            <NamespaceDropdown
              cluster={cluster}
              disabled={!cluster || cluster === ALL_CLUSTERS_KEY}
              includeAllProjects={includeAllProjects}
              onChange={onProjectChange}
              selectedProject={namespace || ALL_PROJECTS}
            />
          </div>
        )}
      </div>
    );
  },
);

ClusterProjectDropdown.displayName = 'ClusterProjectDropdown';

export default ClusterProjectDropdown;
