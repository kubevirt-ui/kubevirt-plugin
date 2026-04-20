import React, { FCC } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';

import { BootableResource } from '../../utils/types';
import { BootableVolumeCallbacks } from '../bootableVolumesDefinition';
import { getEffectiveCluster } from '../utils/helpers';

type BootableVolumeNamespaceCellProps = {
  callbacks: BootableVolumeCallbacks;
  row: BootableResource;
};

const BootableVolumeNamespaceCell: FCC<BootableVolumeNamespaceCellProps> = ({ callbacks, row }) => {
  const cluster = getEffectiveCluster(row, callbacks);

  return (
    <MulticlusterResourceLink
      cluster={cluster}
      groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
      name={getNamespace(row)}
    />
  );
};

export default BootableVolumeNamespaceCell;
