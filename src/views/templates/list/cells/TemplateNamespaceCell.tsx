import React, { FC } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { TemplateOrRequest } from '@kubevirt-utils/resources/template';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';

type TemplateNamespaceCellProps = {
  row: TemplateOrRequest;
};

const TemplateNamespaceCell: FC<TemplateNamespaceCellProps> = ({ row }) => {
  const clusterParam = useClusterParam();
  const cluster = getCluster(row) || clusterParam;
  const namespace = getNamespace(row);

  return (
    <MulticlusterResourceLink
      cluster={cluster}
      groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
      name={namespace}
    />
  );
};

export default TemplateNamespaceCell;
