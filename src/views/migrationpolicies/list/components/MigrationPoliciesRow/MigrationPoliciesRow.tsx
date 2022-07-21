import * as React from 'react';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { LabelGroup } from '@patternfly/react-core';

import MigrationPoliciesActions from '../../../actions/components/MigrationPoliciesActions';
import { MigrationPolicyMatchExpressionSelectorList } from '../MigrationPolicyMatchExpressionSelectorList/MigrationPolicyMatchExpressionSelectorList';
import { MigrationPolicyMatchLabelSelectorList } from '../MigrationPolicyMatchLabelSelectorList/MigrationPolicyMatchLabelSelectorList';

const MigrationPoliciesRow: React.FC<RowProps<V1alpha1MigrationPolicy>> = ({
  obj,
  activeColumnIDs,
}) => {
  const { t } = useKubevirtTranslation();
  const getBooleanText = (value) => (value ? t('YES') : t('NO'));
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs} className="pf-m-width-15">
        <ResourceLink
          groupVersionKind={MigrationPolicyModelGroupVersionKind}
          name={obj?.metadata?.name}
        />
      </TableData>
      <TableData id="bandwidth" activeColumnIDs={activeColumnIDs} className="pf-m-width-10">
        {obj?.spec?.bandwidthPerMigration ?? t('Unlimited')}
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
        <LabelGroup>
          <MigrationPolicyMatchExpressionSelectorList
            matchExpressions={obj?.spec?.selectors?.namespaceSelector?.matchExpressions}
          />
          <MigrationPolicyMatchLabelSelectorList
            matchLabels={obj?.spec?.selectors?.namespaceSelector?.matchLabels}
          />
        </LabelGroup>
      </TableData>
      <TableData id="vm-labels" activeColumnIDs={activeColumnIDs}>
        <LabelGroup>
          <MigrationPolicyMatchExpressionSelectorList
            matchExpressions={
              obj?.spec?.selectors?.virtualMachineInstanceSelector?.matchExpressions
            }
            isVMILabel
          />
          <MigrationPolicyMatchLabelSelectorList
            matchLabels={obj?.spec?.selectors?.virtualMachineInstanceSelector?.matchLabels}
            isVMILabel
          />
        </LabelGroup>
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
