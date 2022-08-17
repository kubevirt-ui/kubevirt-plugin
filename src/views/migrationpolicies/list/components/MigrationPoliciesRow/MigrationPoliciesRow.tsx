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
  obj: mp,
  activeColumnIDs,
}) => (
  <>
    <TableData id="name" activeColumnIDs={activeColumnIDs} className="pf-m-width-15">
      <ResourceLink
        groupVersionKind={MigrationPolicyModelGroupVersionKind}
        name={mp?.metadata?.name}
      />
    </TableData>
    <TableData id="bandwidth" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
      {migrationPolicySpecKeys.BANDWIDTH_PER_MIGRATION in mp?.spec
        ? getBandwidthPerMigrationText(mp?.spec?.bandwidthPerMigration)
        : NO_DATA_DASH}
    </TableData>
    <TableData id="auto-converge" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
      {migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE in mp?.spec
        ? getBooleanText(mp?.spec?.allowAutoConverge)
        : NO_DATA_DASH}
    </TableData>
    <TableData id="post-copy" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
      {migrationPolicySpecKeys.ALLOW_POST_COPY in mp?.spec
        ? getBooleanText(mp?.spec?.allowPostCopy)
        : NO_DATA_DASH}
    </TableData>
    <TableData id="completion-timeout" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
      {migrationPolicySpecKeys.COMPLETION_TIMEOUT_PER_GIB in mp?.spec
        ? getCompletionTimeoutText(mp?.spec?.completionTimeoutPerGiB)
        : NO_DATA_DASH}
    </TableData>
    <TableData id="project-labels" activeColumnIDs={activeColumnIDs}>
      <MigrationPolicySelectorList selector={mp?.spec?.selectors?.namespaceSelector} />
    </TableData>
    <TableData id="vm-labels" activeColumnIDs={activeColumnIDs}>
      <MigrationPolicySelectorList
        selector={mp?.spec?.selectors?.virtualMachineInstanceSelector}
        isVMILabel
      />
    </TableData>
    <TableData
      id="actions"
      activeColumnIDs={activeColumnIDs}
      className="dropdown-kebab-pf pf-c-table__action"
    >
      <MigrationPoliciesActions mp={mp} isKebabToggle />
    </TableData>
  </>
);

export default MigrationPoliciesRow;
