import type { FC } from 'react';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { getDataVolumeClaimName } from '../../utils';

type DataVolumePVCCellProps = {
  row: V1beta1DataVolume;
};

const DataVolumePVCCell: FC<DataVolumePVCCellProps> = ({ row }) => {
  const claimName = getDataVolumeClaimName(row);

  if (!claimName) {
    return <>{NO_DATA_DASH}</>;
  }

  return (
    <ResourceLink
      groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
      name={claimName}
      namespace={getNamespace(row)}
    />
  );
};

export default DataVolumePVCCell;
