import React, { FC } from 'react';

import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import ClusterPreferenceActions from '../../actions/ClusterPreferenceActions';

const ClusterPreferenceRow: FC<RowProps<V1alpha2VirtualMachineClusterPreference>> = ({
  obj: preference,
  activeColumnIDs,
}) => (
  <>
    <TableData id="name" activeColumnIDs={activeColumnIDs}>
      <ResourceLink
        groupVersionKind={VirtualMachineClusterPreferenceModelGroupVersionKind}
        name={preference?.metadata?.name}
      />
    </TableData>
    <TableData id="vendor" activeColumnIDs={activeColumnIDs}>
      {getLabel(preference, VENDOR_LABEL, NO_DATA_DASH)}
    </TableData>
    <TableData
      id=""
      activeColumnIDs={activeColumnIDs}
      className="dropdown-kebab-pf pf-c-table__action"
    >
      <ClusterPreferenceActions preference={preference} isKebabToggle />
    </TableData>
  </>
);

export default ClusterPreferenceRow;
