import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Content } from '@patternfly/react-core';
import { AngleRightIcon, ClusterIcon, ProjectDiagramIcon } from '@patternfly/react-icons';

const SummaryTitle = () => {
  const { t } = useKubevirtTranslation();
  const isACM = useIsACMPage();
  const cluster = useClusterParam();
  const namespace = useNamespaceParam();

  const acmNamespaceSummary = namespace
    ? `${namespace} (${t('project')})`
    : t('All projects summary');

  const namespaceSummary = namespace ?? t('All projects summary');

  return (
    <Content className="vm-list-summary__expand-section-toggle" component="h3">
      {isACM && (
        <>
          <ClusterIcon className="vm-list-summary__expand-section-toggle-icon" />
          {cluster ? `${cluster} (${t('cluster')})` : t('All clusters')}

          <AngleRightIcon className="vm-list-summary__expand-section-toggle-arrow-icon" />
        </>
      )}
      <ProjectDiagramIcon className="vm-list-summary__expand-section-toggle-icon" />{' '}
      {isACM ? acmNamespaceSummary : namespaceSummary}
    </Content>
  );
};

export default SummaryTitle;
