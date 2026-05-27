import React, { FC, JSX, memo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import ClusterDropdown from '@kubevirt-utils/components/ClusterNamespaceDropdown/ClusterDropdown';
import NamespaceDropdown from '@kubevirt-utils/components/ClusterNamespaceDropdown/NamespaceDropdown';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_CLUSTERS_KEY, ALL_NAMESPACES_KEY } from '@kubevirt-utils/hooks/constants';
import { useClusterCNVInstalled } from '@kubevirt-utils/hooks/useAlerts/utils/useClusterCNVInstalled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useNamespaces from '@kubevirt-utils/hooks/useNamespaces';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useFleetClusterNames, useHubClusterName } from '@stolostron/multicluster-sdk';

import { useDisabledClusterRedirect } from './hooks/useDisabledClusterRedirect';
import { useInitialClusterSelection } from './hooks/useInitialClusterSelection';
import { useInitialNamespaceSelection } from './hooks/useInitialNamespaceSelection';

import './ClusterNamespaceDropdown.scss';

type ClusterNamespaceDropdownProps = {
  disabledClusters?: string[];
  disabledItemTooltip?: string;
  includeAllClusters?: boolean;
  includeAllNamespaces?: boolean;
  onlyCNVClusters?: boolean;
  showClusterDropdown?: boolean;
  showNamespaceDropdown?: boolean;
};

const ClusterNamespaceDropdown: FC<ClusterNamespaceDropdownProps> = memo(
  ({
    disabledClusters,
    disabledItemTooltip,
    includeAllClusters,
    includeAllNamespaces,
    onlyCNVClusters = false,
    showClusterDropdown = true,
    showNamespaceDropdown = true,
  }): JSX.Element | null => {
    const { t } = useKubevirtTranslation();
    const isACMPage = useIsACMPage();
    const cluster = useActiveClusterParam();
    const selectedCluster = useClusterParam();
    const namespace = useNamespaceParam();
    const navigate = useNavigate();
    const location = useLocation();
    const [hubClusterName, hubClusterNameLoaded] = useHubClusterName();
    const [namespaces, namespaceLoaded] = useNamespaces(cluster || hubClusterName);
    const { cnvNotInstalledClusters, loaded: cnvLoaded } = useClusterCNVInstalled();
    const [clusterNames, clustersLoaded] = useFleetClusterNames();

    const onClusterChange = useCallback(
      (newCluster: string) => {
        const clusterReplaceKey =
          newCluster === ALL_CLUSTERS_KEY ? `/${ALL_CLUSTERS_KEY}/` : `/cluster/${newCluster}/`;
        let newPathname = location.pathname
          .replace(`/cluster/${cluster}/`, clusterReplaceKey)
          .replace(`/${ALL_CLUSTERS_KEY}/`, clusterReplaceKey);

        // Reset namespace to "all namespaces" or default namespace when cluster changes
        if (namespace) {
          newPathname = newPathname.replace(
            `/ns/${namespace}/`,
            includeAllNamespaces ? `/${ALL_NAMESPACES_KEY}/` : `/ns/${DEFAULT_NAMESPACE}/`,
          );
        }

        navigate(newPathname);
      },
      [location.pathname, cluster, namespace, navigate],
    );

    const onNamespaceChange = useCallback(
      (newNamespace: string) => {
        const namespaceReplaceKey =
          newNamespace === ALL_NAMESPACES_KEY ? `/${ALL_NAMESPACES_KEY}/` : `/ns/${newNamespace}/`;
        const newPathname = location.pathname
          .replace(`/ns/${namespace}/`, namespaceReplaceKey)
          .replace(`/${ALL_NAMESPACES_KEY}/`, namespaceReplaceKey);
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

    useInitialNamespaceSelection({
      cluster,
      includeAllNamespaces,
      isACMPage,
      namespace,
      onNamespaceChange,
      namespaceLoaded,
      namespaces,
      showNamespaceDropdown,
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
      <div className="cluster-namespace-dropdown">
        {showClusterDropdown && (
          <div className="cluster-namespace-dropdown__cluster">
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
        {showNamespaceDropdown && (
          <div className="cluster-namespace-dropdown__namespace">
            {t('Namespace')}:
            <NamespaceDropdown
              cluster={cluster}
              disabled={!cluster || cluster === ALL_CLUSTERS_KEY}
              disabledTooltip={t('Namespace can be selected only at a cluster level')}
              includeAllNamespaces={includeAllNamespaces}
              onChange={onNamespaceChange}
              selectedNamespace={namespace || ALL_NAMESPACES_KEY}
            />
          </div>
        )}
      </div>
    );
  },
);

ClusterNamespaceDropdown.displayName = 'ClusterNamespaceDropdown';

export default ClusterNamespaceDropdown;
