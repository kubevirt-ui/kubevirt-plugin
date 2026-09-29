import type { FC } from 'react';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import VerifiedResourceLink from '@kubevirt-utils/components/VerifiedResourceLink/VerifiedResourceLink';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { type DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { Skeleton } from '@patternfly/react-core';

import { isPVCSource } from '../utils/helpers';

type DiskSourceCellProps = {
  row: DiskRowDataLayout;
  sourcesLoaded?: boolean;
  vm: V1VirtualMachine;
};

const DiskSourceCell: FC<DiskSourceCellProps> = ({ row, sourcesLoaded, vm }) => {
  const { hasDataVolume, namespace, source } = row;
  const dataTestId = `disk-source-${row.name}`;

  const hasPVC = isPVCSource(row);

  if (!sourcesLoaded && (hasPVC || hasDataVolume)) {
    return <Skeleton data-test-id={dataTestId} width="200px" />;
  }

  if (sourcesLoaded && (hasPVC || hasDataVolume)) {
    return (
      <span data-test-id={dataTestId}>
        <VerifiedResourceLink
          cluster={getCluster(vm)}
          groupVersionKind={modelToGroupVersionKind(
            hasDataVolume ? DataVolumeModel : PersistentVolumeClaimModel,
          )}
          name={source}
          namespace={namespace ?? getNamespace(vm)}
        />
      </span>
    );
  }

  return <span data-test-id={dataTestId}>{source ?? NO_DATA_DASH}</span>;
};

export default DiskSourceCell;
