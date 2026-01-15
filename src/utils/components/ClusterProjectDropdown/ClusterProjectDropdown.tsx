import React, { FC, JSX, memo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import ClusterDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown';
import NamespaceDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/NamespaceDropdown';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_CLUSTERS_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useClusterCNVInstalled } from '@kubevirt-utils/hooks/useAlerts/utils/useClusterCNVInstalled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useFleetClusterNames, useHubClusterName } from '@stolostron/multicluster-sdk';

import { useDisabledClusterRedirect } from './hooks/useDisabledClusterRedirect';
import { useInitialClusterSelection } from './hooks/useInitialClusterSelection';
import { useInitialProjectSelection } from './hooks/useInitialProjectSelection';

import './ClusterProjectDropdown.scss';

type ClusterProjectDropdownProps = {
  disabledClusters?: string[];
  disabledItemTooltip?: string;
  includeAllClusters?: boolean;
  includeAllProjects?: boolean;
  onlyCNVClusters?: boolean;
  showClusterDropdown?: boolean;
  showProjectDropdown?: boolean;
};

const ClusterProjectDropdown: FC<ClusterProjectDropdownProps> = memo(
  ({
    disabledClusters,
    disabledItemTooltip,
    includeAllClusters,
    includeAllProjects,
    onlyCNVClusters = false,
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
    const { cnvNotInstalledClusters, loaded: cnvLoaded } = useClusterCNVInstalled();
    const [clusterNames, clustersLoaded] = useFleetClusterNames();

    const onClusterChange = useCallback(
      (newCluster: string) => {
        const clusterReplaceKey =
          newCluster === ALL_CLUSTERS_KEY ? '/all-clusters/' : `/cluster/${newCluster}/`;
        let newPathname = location.pathname
          .replace(`/cluster/${cluster}/`, clusterReplaceKey)
          .replace('/all-clusters/', clusterReplaceKey);

        // Reset project to "all projects" or default project when cluster changes
        if (namespace) {
          newPathname = newPathname.replace(
            `/ns/${namespace}/`,
            includeAllProjects ? '/all-namespaces/' : `/ns/${DEFAULT_NAMESPACE}/`,
          );
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

    useInitialClusterSelection({
      hubClusterName,
      hubClusterNameLoaded,
      includeAllClusters,
      isACMPage,
      onClusterChange,
      selectedCluster,
    });

    useInitialProjectSelection({
      cluster,
      includeAllProjects,
      isACMPage,
      namespace,
      onProjectChange,
      projectLoaded,
      projects,
      showProjectDropdown,
    });

    useDisabledClusterRedirect({
      cluster,
      clusterNames,
      clustersLoaded,
      cnvLoaded,
      cnvNotInstalledClusters,
      disabledClusters,
      hubClusterName,
      hubClusterNameLoaded,
      includeAllClusters,
      isACMPage,
      onClusterChange,
      onlyCNVClusters,
    });

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
              disabledClusters={disabledClusters}
              disabledItemTooltip={disabledItemTooltip}
              includeAllClusters={includeAllClusters}
              omittedClusters={onlyCNVClusters && cnvLoaded ? cnvNotInstalledClusters : undefined}
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
              disabledTooltip={t('Project can be selected only at a cluster level')}
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
