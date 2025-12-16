import React, { FC, JSX, memo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import ClusterDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown';
import NamespaceDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/NamespaceDropdown';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_CLUSTERS_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useClusterCNVInstalled } from '@kubevirt-utils/hooks/useAlerts/utils/useClusterCNVInstalled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useFleetClusterNames, useHubClusterName } from '@stolostron/multicluster-sdk';

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
    }, [
      isACMPage,
      cluster,
      hubClusterName,
      hubClusterNameLoaded,
      includeAllClusters,
      onClusterChange,
    ]);

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
      isACMPage,
      cluster,
      includeAllProjects,
      namespace,
      onProjectChange,
      projectLoaded,
      projects,
      showProjectDropdown,
    ]);

    // Redirect if current cluster is disabled
    useEffect(() => {
      if (!isACMPage) return;
      if (
        !clustersLoaded ||
        !cluster ||
        cluster === ALL_CLUSTERS_KEY ||
        !disabledClusters ||
        disabledClusters.length === 0
      ) {
        return;
      }

      const isCurrentClusterDisabled = disabledClusters.includes(cluster);
      if (!isCurrentClusterDisabled) {
        return;
      }

      // Find first enabled cluster
      const omittedSet = new Set(onlyCNVClusters && cnvLoaded ? cnvNotInstalledClusters : []);
      const disabledSet = new Set(disabledClusters);

      // If includeAllClusters is true, prefer "all clusters"
      if (includeAllClusters) {
        onClusterChange(ALL_CLUSTERS_KEY);
        return;
      }

      // Otherwise, find first enabled cluster
      const enabledCluster = clusterNames?.find(
        (name) => !omittedSet.has(name) && !disabledSet.has(name),
      );

      const redirectTo = (next: string | undefined): void => {
        if (next && next !== cluster) {
          onClusterChange(next);
        }
      };

      if (enabledCluster) {
        redirectTo(enabledCluster);
      } else if (
        hubClusterNameLoaded &&
        hubClusterName &&
        !omittedSet.has(hubClusterName) &&
        !disabledSet.has(hubClusterName)
      ) {
        // Fallback to hub cluster only if it is enabled and not CNV-omitted
        redirectTo(hubClusterName);
      }
    }, [
      isACMPage,
      cluster,
      clustersLoaded,
      clusterNames,
      cnvLoaded,
      cnvNotInstalledClusters,
      disabledClusters,
      hubClusterName,
      hubClusterNameLoaded,
      includeAllClusters,
      onlyCNVClusters,
      onClusterChange,
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
