import React, { FC } from 'react';

import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import RedHatLabel from '@kubevirt-utils/components/RedHatLabel/RedHatLabel';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { getName } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { getCluster } from '@multicluster/helpers/selectors';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { FleetResourceLink } from '@stolostron/multicluster-sdk';

import ClusterInstancetypeActions from '../../actions/ClusterInstancetypeActions';

const ClusterInstancetypeRow: FC<RowProps<V1beta1VirtualMachineClusterInstancetype>> = ({
  activeColumnIDs,
  obj: it,
}) => (
  <>
    <TableData activeColumnIDs={activeColumnIDs} id="name">
      <FleetResourceLink
        cluster={getCluster(it)}
        groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
        inline
        name={getName(it)}
      />
      <RedHatLabel obj={it} />
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="cluster">
      {it?.cluster}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="cpu">
      {it?.spec?.cpu?.guest}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="memory">
      {/* issues with  multicluster sdk where the guest is a number, not a string */}
      {getHumanizedSize(it?.spec?.memory?.guest?.toString())?.string}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="vendor">
      {getLabel(it, VENDOR_LABEL, NO_DATA_DASH)}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
      <ClusterInstancetypeActions instanceType={it} isKebabToggle />
    </TableData>
  </>
);

export default ClusterInstancetypeRow;
