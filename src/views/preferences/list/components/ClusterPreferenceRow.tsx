import React, { FC } from 'react';

import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import RedHatLabel from '@kubevirt-utils/components/RedHatLabel/RedHatLabel';
import { VENDOR_LABEL } from '@kubevirt-utils/constants/constants';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import ClusterPreferenceActions from '../../actions/ClusterPreferenceActions';

const ClusterPreferenceRow: FC<RowProps<V1beta1VirtualMachineClusterPreference>> = ({
  activeColumnIDs,
  obj: preference,
}) => (
  <>
    <TableData activeColumnIDs={activeColumnIDs} id="name">
      <MulticlusterResourceLink
        cluster={getCluster(preference)}
        groupVersionKind={VirtualMachineClusterPreferenceModelGroupVersionKind}
        inline
        name={getName(preference)}
      />
      <RedHatLabel obj={preference} />
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="vendor">
      {getLabel(preference, VENDOR_LABEL, NO_DATA_DASH)}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
      <ClusterPreferenceActions isKebabToggle preference={preference} />
    </TableData>
  </>
);

export default ClusterPreferenceRow;
