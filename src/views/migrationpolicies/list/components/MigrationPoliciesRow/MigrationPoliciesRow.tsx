import * as React from 'react';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import MigrationPoliciesActions from '../../../actions/components/MigrationPoliciesActions';
import { MigrationPolicyMatchExpressionSelectorList } from '../MigrationPolicyMatchExpressionSelectorList/MigrationPolicyMatchExpressionSelectorList';
import { MigrationPolicyMatchLabelSelectorList } from '../MigrationPolicyMatchLabelSelectorList/MigrationPolicyMatchLabelSelectorList';

const MigrationPoliciesRow: React.FC<RowProps<V1alpha1MigrationPolicy>> = ({
  obj,
  activeColumnIDs,
}) => {
  const { t } = useKubevirtTranslation();
  const getBooleanText = (value: boolean) => (value ? t('YES') : t('NO'));

  const getBandwidthPerMigrationText = (bandwidth: string | number): string | number => {
    if (!bandwidth || bandwidth === '0') return t('Unlimited');
    if (typeof bandwidth === 'string') return readableSizeUnit(bandwidth);
    return bandwidth;
  };

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs} className="pf-m-width-15">
        <ResourceLink
          groupVersionKind={MigrationPolicyModelGroupVersionKind}
          name={obj?.metadata?.name}
        />
      </TableData>
      <TableData id="bandwidth" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
        {getBandwidthPerMigrationText(obj?.spec?.bandwidthPerMigration)}
      </TableData>
      <TableData id="auto-converge" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
        {getBooleanText(obj?.spec?.allowAutoConverge)}
      </TableData>
      <TableData id="post-copy" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
        {getBooleanText(obj?.spec?.allowPostCopy)}
      </TableData>
      <TableData
        id="completion-timeout"
        activeColumnIDs={activeColumnIDs}
        className="pf-m-width-10"
      >
        {obj?.spec?.completionTimeoutPerGiB ?? NO_DATA_DASH}
      </TableData>
      <TableData id="project-labels" activeColumnIDs={activeColumnIDs}>
        <MigrationPolicyMatchExpressionSelectorList
          matchExpressions={obj?.spec?.selectors?.namespaceSelector?.matchExpressions}
        />{' '}
        <MigrationPolicyMatchLabelSelectorList
          matchLabels={obj?.spec?.selectors?.namespaceSelector?.matchLabels}
        />
      </TableData>
      <TableData id="vm-labels" activeColumnIDs={activeColumnIDs}>
        <MigrationPolicyMatchExpressionSelectorList
          matchExpressions={obj?.spec?.selectors?.virtualMachineInstanceSelector?.matchExpressions}
          isVMILabel
        />{' '}
        <MigrationPolicyMatchLabelSelectorList
          matchLabels={obj?.spec?.selectors?.virtualMachineInstanceSelector?.matchLabels}
          isVMILabel
        />
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <MigrationPoliciesActions mp={obj} isKebabToggle />
      </TableData>
    </>
  );
};

export default MigrationPoliciesRow;
