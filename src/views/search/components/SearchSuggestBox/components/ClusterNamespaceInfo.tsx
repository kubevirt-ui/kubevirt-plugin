import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SearchSuggestResource } from '@search/utils/types';

type ClusterNamespaceInfoProps = {
  isAllClusters: boolean;
  isAllNamespaces: boolean;
  resource: SearchSuggestResource;
};

const ClusterNamespaceInfo: FC<ClusterNamespaceInfoProps> = ({
  isAllClusters,
  isAllNamespaces,
  resource,
}) => {
  const { t } = useKubevirtTranslation();

  const { cluster, namespace } = resource;

  const getInfoText = (title: string, value: string) => (
    <span>
      <span className="pf-v6-u-font-weight-bold">{title}</span>{' '}
      <span className="pf-v6-u-text-color-subtle">{value}</span>
    </span>
  );

  const namespaceTitle = getInfoText(t('namespace'), namespace);
  const clusterTitle = getInfoText(t('cluster'), cluster);

  if (isAllClusters) {
    return (
      <span>
        {clusterTitle}
        <span className="pf-v6-u-text-color-subtle">, </span>
        {namespaceTitle}
      </span>
    );
  }

  return isAllNamespaces ? namespaceTitle : null;
};

export default ClusterNamespaceInfo;
