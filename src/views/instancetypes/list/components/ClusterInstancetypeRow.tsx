import React, { FC } from 'react';

import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha2VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import RedHatLabel from '@kubevirt-utils/components/RedHatLabel/RedHatLabel';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import ClusterInstancetypeActions from '../../actions/ClusterInstancetypeActions';

const ClusterInstancetypeRow: FC<RowProps<V1alpha2VirtualMachineClusterInstancetype>> = ({
  activeColumnIDs,
  obj: it,
}) => (
  <>
    <TableData activeColumnIDs={activeColumnIDs} id="name">
      <ResourceLink
        groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
        inline
        name={it?.metadata?.name}
      />
      <RedHatLabel obj={it} />
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="cpu">
      {it?.spec?.cpu?.guest}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="memory">
      {readableSizeUnit(it?.spec?.memory?.guest)}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="vendor">
      {getLabel(it, VENDOR_LABEL, NO_DATA_DASH)}
    </TableData>
    <TableData
      activeColumnIDs={activeColumnIDs}
      className="dropdown-kebab-pf pf-c-table__action"
      id=""
    >
      <ClusterInstancetypeActions instanceType={it} isKebabToggle />
    </TableData>
  </>
);

export default ClusterInstancetypeRow;
