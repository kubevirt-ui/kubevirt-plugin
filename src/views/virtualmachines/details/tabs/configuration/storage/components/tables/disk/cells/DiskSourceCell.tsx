import React, { FC } from 'react';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { Skeleton } from '@patternfly/react-core';

type DiskSourceCellProps = {
  row: DiskRowDataLayout;
  sourcesLoaded?: boolean;
  vm: V1VirtualMachine;
};

const DiskSourceCell: FC<DiskSourceCellProps> = ({ row, sourcesLoaded, vm }) => {
  const { hasDataVolume, hasPVC, namespace, source } = row;
  const dataTestId = `disk-source-${row.name}`;

  if (!sourcesLoaded && (hasPVC || hasDataVolume)) {
    return <Skeleton data-test={dataTestId} width="200px" />;
  }

  if (sourcesLoaded && (hasPVC || hasDataVolume)) {
    return (
      <span data-test={dataTestId}>
        <MulticlusterResourceLink
          groupVersionKind={modelToGroupVersionKind(
            hasDataVolume ? DataVolumeModel : PersistentVolumeClaimModel,
          )}
          cluster={getCluster(vm)}
          name={source}
          namespace={namespace ?? getNamespace(vm)}
        />
      </span>
    );
  }

  return <span data-test={dataTestId}>{source ?? NO_DATA_DASH}</span>;
};

export default DiskSourceCell;
