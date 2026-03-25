import React, { FC } from 'react';

import {
  modelToGroupVersionKind,
  NamespaceModel,
  V1Template,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';

type TemplateNamespaceCellProps = {
  row: V1Template;
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
