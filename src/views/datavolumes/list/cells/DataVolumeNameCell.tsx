import type { FC } from 'react';

import { DataVolumeModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type DataVolumeNameCellProps = {
  row: V1beta1DataVolume;
};

const DataVolumeNameCell: FC<DataVolumeNameCellProps> = ({ row }) => (
  <ResourceLink
    groupVersionKind={modelToGroupVersionKind(DataVolumeModel)}
    name={getName(row)}
    namespace={getNamespace(row)}
  />
);

export default DataVolumeNameCell;
