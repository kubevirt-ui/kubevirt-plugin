import React, { FC } from 'react';

import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha2VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import ClusterInstancetypeActions from '../../actions/ClusterInstancetypeActions';

const ClusterInstancetypeRow: FC<RowProps<V1alpha2VirtualMachineClusterInstancetype>> = ({
  obj: it,
  activeColumnIDs,
}) => (
  <>
    <TableData id="name" activeColumnIDs={activeColumnIDs}>
      <ResourceLink
        groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
        name={it?.metadata?.name}
      />
    </TableData>
    <TableData id="cpu" activeColumnIDs={activeColumnIDs}>
      {it?.spec?.cpu?.guest}
    </TableData>
    <TableData id="memory" activeColumnIDs={activeColumnIDs}>
      {readableSizeUnit(it?.spec?.memory?.guest)}
    </TableData>
    <TableData id="vendor" activeColumnIDs={activeColumnIDs}>
      {getLabel(it, VENDOR_LABEL, NO_DATA_DASH)}
    </TableData>
    <TableData
      id=""
      activeColumnIDs={activeColumnIDs}
      className="dropdown-kebab-pf pf-c-table__action"
    >
      <ClusterInstancetypeActions instanceType={it} isKebabToggle />
    </TableData>
  </>
);

export default ClusterInstancetypeRow;
