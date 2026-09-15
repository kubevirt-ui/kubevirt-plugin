import type { FC } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';

import type { BootableVolumeCallbacks } from '../bootableVolumesDefinition';

import type { BootableResource } from '../../utils/types';
import { getEffectiveCluster } from '../utils/helpers';

type BootableVolumeNamespaceCellProps = {
  callbacks: BootableVolumeCallbacks;
  row: BootableResource;
};

const BootableVolumeNamespaceCell: FC<BootableVolumeNamespaceCellProps> = ({ callbacks, row }) => {
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
