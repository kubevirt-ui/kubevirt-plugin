import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useListNamespaces from '@kubevirt-utils/hooks/useListNamespaces';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Button } from '@patternfly/react-core';
import { useFleetAccessReview, useHubClusterName } from '@stolostron/multicluster-sdk';

const VirtualMachineTemplatesCreateButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const [hubClusterName] = useHubClusterName();
  const selectedClusters = useListClusters();
  const selectedNamespaces = useListNamespaces();
  const navigate = useNavigate();
  const cluster = selectedClusters?.[0] || hubClusterName;
  const namespace = selectedNamespaces?.[0] || DEFAULT_NAMESPACE;
  const isACMPage = useIsACMPage();

  const [canCreateTemplate] = useFleetAccessReview({
    cluster,
    group: TemplateModel.apiGroup,
    namespace,
    resource: TemplateModel.plural,
    verb: 'create',
  });

  return (
    <Button
      onClick={() => {
        navigate(
          isACMPage
            ? `/k8s/cluster/${cluster}/ns/${namespace}/templates/~new`
            : `/k8s/ns/${namespace}/templates/~new`,
        );
      }}
      data-test="item-create"
      isDisabled={!canCreateTemplate}
    >
      {t('Create Template')}
    </Button>
  );
};

export default VirtualMachineTemplatesCreateButton;
