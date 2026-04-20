import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SearchSuggestResource } from '@search/utils/types';

type ClusterProjectInfoProps = {
  isAllClusters: boolean;
  isAllNamespaces: boolean;
  resource: SearchSuggestResource;
};

const ClusterProjectInfo: FCC<ClusterProjectInfoProps> = ({
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

  const projectTitle = getInfoText(t('project'), namespace);
  const clusterTitle = getInfoText(t('cluster'), cluster);

  if (isAllClusters) {
    return (
      <span>
        {clusterTitle}
        <span className="pf-v6-u-text-color-subtle">, </span>
        {projectTitle}
      </span>
    );
  }

  return isAllNamespaces ? projectTitle : null;
};

export default ClusterProjectInfo;
