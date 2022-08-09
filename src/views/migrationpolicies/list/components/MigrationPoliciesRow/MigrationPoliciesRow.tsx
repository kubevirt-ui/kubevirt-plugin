import * as React from 'react';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import MigrationPoliciesActions from '../../../actions/components/MigrationPoliciesActions';
import { MigrationPolicyMatchLabelSelectorList } from '../../../components/MigrationPolicyMatchLabelSelectorList/MigrationPolicyMatchLabelSelectorList';
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
      {getBandwidthPerMigrationText(mp?.spec?.bandwidthPerMigration)}
    </TableData>
    <TableData id="auto-converge" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
      {getBooleanText(mp?.spec?.allowAutoConverge)}
    </TableData>
    <TableData id="post-copy" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
      {getBooleanText(mp?.spec?.allowPostCopy)}
    </TableData>
    <TableData id="completion-timeout" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
      {getCompletionTimeoutText(mp?.spec?.completionTimeoutPerGiB)}
    </TableData>
    <TableData id="project-labels" activeColumnIDs={activeColumnIDs}>
      <MigrationPolicyMatchLabelSelectorList
        matchLabels={mp?.spec?.selectors?.namespaceSelector?.matchLabels}
      />
    </TableData>
    <TableData id="vm-labels" activeColumnIDs={activeColumnIDs}>
      <MigrationPolicyMatchLabelSelectorList
        matchLabels={mp?.spec?.selectors?.virtualMachineInstanceSelector?.matchLabels}
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
