import React, { FC } from 'react';

import { VirtualMachinePreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachinePreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import RedHatLabel from '@kubevirt-utils/components/RedHatLabel/RedHatLabel';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import UserPreferenceActions from '../../actions/UserPreferenceActions';

const UserPreferenceRow: FC<RowProps<V1beta1VirtualMachinePreference>> = ({
  activeColumnIDs,
  obj: preference,
}) => (
  <>
    <TableData activeColumnIDs={activeColumnIDs} id="name">
      <ResourceLink
        groupVersionKind={VirtualMachinePreferenceModelGroupVersionKind}
        inline
        name={getName(preference)}
        namespace={getNamespace(preference)}
      />
      <RedHatLabel obj={preference} />
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="namespace">
      {getNamespace(preference)}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="vendor">
      {getLabel(preference, VENDOR_LABEL, NO_DATA_DASH)}
    </TableData>
    <TableData
      activeColumnIDs={activeColumnIDs}
      className="dropdown-kebab-pf pf-v5-c-table__action"
      id=""
    >
      <UserPreferenceActions isKebabToggle preference={preference} />
    </TableData>
  </>
);

export default UserPreferenceRow;
