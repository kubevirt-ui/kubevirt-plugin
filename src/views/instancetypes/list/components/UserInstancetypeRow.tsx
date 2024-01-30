import React, { FC } from 'react';

import { VirtualMachineInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import RedHatLabel from '@kubevirt-utils/components/RedHatLabel/RedHatLabel';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import UserInstancetypeActions from '../../actions/UserInstancetypeActions';

const UserInstancetypeRow: FC<RowProps<V1beta1VirtualMachineClusterInstancetype>> = ({
  activeColumnIDs,
  obj: it,
}) => (
  <>
    <TableData activeColumnIDs={activeColumnIDs} id="name">
      <ResourceLink
        groupVersionKind={VirtualMachineInstancetypeModelGroupVersionKind}
        inline
        name={getName(it)}
        namespace={getNamespace(it)}
      />
      <RedHatLabel obj={it} />
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="namespace">
      {getNamespace(it)}
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
      className="dropdown-kebab-pf pf-v5-c-table__action"
      id=""
    >
      <UserInstancetypeActions instanceType={it} isKebabToggle />
    </TableData>
  </>
);

export default UserInstancetypeRow;
