import React, { FCC } from 'react';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';

import MigrationPoliciesActions from '../actions/components/MigrationPoliciesActions';
import { MigrationPolicySelectorList } from '../components/MigrationPolicySelectorList/MigrationPolicySelectorList';
import { migrationPolicySpecKeys } from '../utils/constants';
import {
  getBandwidthPerMigrationText,
  getBooleanText,
  getCompletionTimeoutText,
} from '../utils/utils';

type CellProps = {
  row: V1alpha1MigrationPolicy;
};

export const NameCell: FCC<CellProps> = ({ row }) => {
  const isACMPage = useIsACMPage();
  const cluster = getCluster(row);

  return (
    <span data-test={`migration-policy-name-${getName(row)}`}>
      <MulticlusterResourceLink
        cluster={isACMPage ? cluster : undefined}
        groupVersionKind={MigrationPolicyModelGroupVersionKind}
        name={getName(row)}
      />
    </span>
  );
};

export const ClusterCell: FCC<CellProps> = ({ row }) => {
  const cluster = getCluster(row);

  return (
    <span data-test={`migration-policy-cluster-${getName(row)}`}>{cluster ?? NO_DATA_DASH}</span>
  );
};

export const BandwidthCell: FCC<CellProps> = ({ row }) => {
  const hasBandwidth = migrationPolicySpecKeys.BANDWIDTH_PER_MIGRATION in (row?.spec || {});

  return (
    <span data-test={`migration-policy-bandwidth-${getName(row)}`}>
      {hasBandwidth ? getBandwidthPerMigrationText(row?.spec?.bandwidthPerMigration) : NO_DATA_DASH}
    </span>
  );
};

export const AutoConvergeCell: FCC<CellProps> = ({ row }) => {
  const hasAutoConverge = migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE in (row?.spec || {});

  return (
    <span data-test={`migration-policy-auto-converge-${getName(row)}`}>
      {hasAutoConverge ? getBooleanText(row?.spec?.allowAutoConverge) : NO_DATA_DASH}
    </span>
  );
};

export const PostCopyCell: FCC<CellProps> = ({ row }) => {
  const hasPostCopy = migrationPolicySpecKeys.ALLOW_POST_COPY in (row?.spec || {});

  return (
    <span data-test={`migration-policy-post-copy-${getName(row)}`}>
      {hasPostCopy ? getBooleanText(row?.spec?.allowPostCopy) : NO_DATA_DASH}
    </span>
  );
};

export const CompletionTimeoutCell: FCC<CellProps> = ({ row }) => {
  const hasCompletionTimeout =
    migrationPolicySpecKeys.COMPLETION_TIMEOUT_PER_GIB in (row?.spec || {});

  return (
    <span data-test={`migration-policy-completion-timeout-${getName(row)}`}>
      {hasCompletionTimeout
        ? getCompletionTimeoutText(row?.spec?.completionTimeoutPerGiB)
        : NO_DATA_DASH}
    </span>
  );
};

export const ProjectLabelsCell: FCC<CellProps> = ({ row }) => (
  <span data-test={`migration-policy-project-labels-${getName(row)}`}>
    <MigrationPolicySelectorList selector={row?.spec?.selectors?.namespaceSelector} />
  </span>
);

export const VMLabelsCell: FCC<CellProps> = ({ row }) => (
  <span data-test={`migration-policy-vm-labels-${getName(row)}`}>
    <MigrationPolicySelectorList
      isVMILabel
      selector={row?.spec?.selectors?.virtualMachineInstanceSelector}
    />
  </span>
);

export const ActionsCell: FCC<CellProps> = ({ row }) => (
  <MigrationPoliciesActions isKebabToggle mp={row} />
);
