import * as React from 'react';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import MigrationPoliciesActions from '../../../actions/components/MigrationPoliciesActions';
import { MigrationPolicySelectorList } from '../../../components/MigrationPolicySelectorList/MigrationPolicySelectorList';
import { migrationPolicySpecKeys } from '../../../utils/constants';
import {
  getBandwidthPerMigrationText,
  getBooleanText,
  getCompletionTimeoutText,
} from '../../../utils/utils';

const MigrationPoliciesRow: React.FC<RowProps<V1alpha1MigrationPolicy>> = ({
  activeColumnIDs,
  obj: mp,
}) => (
  <>
    <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="name">
      <ResourceLink
        groupVersionKind={MigrationPolicyModelGroupVersionKind}
        name={mp?.metadata?.name}
      />
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-10" id="bandwidth">
      {migrationPolicySpecKeys.BANDWIDTH_PER_MIGRATION in mp?.spec
        ? getBandwidthPerMigrationText(mp?.spec?.bandwidthPerMigration)
        : NO_DATA_DASH}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-10" id="auto-converge">
      {migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE in mp?.spec
        ? getBooleanText(mp?.spec?.allowAutoConverge)
        : NO_DATA_DASH}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-10" id="post-copy">
      {migrationPolicySpecKeys.ALLOW_POST_COPY in mp?.spec
        ? getBooleanText(mp?.spec?.allowPostCopy)
        : NO_DATA_DASH}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-10" id="completion-timeout">
      {migrationPolicySpecKeys.COMPLETION_TIMEOUT_PER_GIB in mp?.spec
        ? getCompletionTimeoutText(mp?.spec?.completionTimeoutPerGiB)
        : NO_DATA_DASH}
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="project-labels">
      <MigrationPolicySelectorList selector={mp?.spec?.selectors?.namespaceSelector} />
    </TableData>
    <TableData activeColumnIDs={activeColumnIDs} id="vm-labels">
      <MigrationPolicySelectorList
        isVMILabel
        selector={mp?.spec?.selectors?.virtualMachineInstanceSelector}
      />
    </TableData>
    <TableData
      activeColumnIDs={activeColumnIDs}
      className="dropdown-kebab-pf pf-c-table__action"
      id=""
    >
      <MigrationPoliciesActions isKebabToggle mp={mp} />
    </TableData>
  </>
);

export default MigrationPoliciesRow;
