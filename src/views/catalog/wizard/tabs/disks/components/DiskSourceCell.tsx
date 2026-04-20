import React, { FCC } from 'react';

import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import useClusterParam from '@multicluster/hooks/useClusterParam';

type DiskSourceCellProps = {
  row: DiskRowDataLayout;
};

const DiskSourceCell: FCC<DiskSourceCellProps> = ({ row }) => {
  const cluster = useClusterParam();
  const isPVCSource = row?.namespace != null;

  if (isPVCSource) {
    return (
      <MulticlusterResourceLink
        cluster={cluster}
        groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
        name={row?.source}
        namespace={row?.namespace}
      />
    );
  }

  return <>{row?.source ?? NO_DATA_DASH}</>;
};

export default DiskSourceCell;
