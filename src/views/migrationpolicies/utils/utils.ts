import { MigrationPolicyModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getClusterResourceRoute } from '@multicluster/urls';
import { type ExtensionK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { SortByDirection } from '@patternfly/react-table';

import { type MigrationPolicyBooleanSpecKey, migrationPolicySpecKeys } from './constants';

export const getMigrationPolicyNamespaceSelector = (
  policy: V1alpha1MigrationPolicy,
): Record<string, string> | undefined => policy?.spec?.selectors?.namespaceSelector;

export const getMigrationPolicyVirtualMachineInstanceSelector = (
  policy: V1alpha1MigrationPolicy,
): Record<string, string> | undefined => policy?.spec?.selectors?.virtualMachineInstanceSelector;

export const getSelectorLabelsValue = (selector?: Record<string, string>): string => {
  if (!selector || isEmpty(selector)) {
    return NO_DATA_DASH;
  }

  return Object.entries(selector)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
};

export const getBooleanText = (value?: boolean): string => (value ? t('Yes') : t('No'));

export const getMigrationPolicyBooleanDisplayValue = (
  policy: V1alpha1MigrationPolicy,
  specKey: MigrationPolicyBooleanSpecKey,
): string => {
  if (!(specKey in (policy?.spec || {}))) {
    return NO_DATA_DASH;
  }

  return getBooleanText(Boolean(policy.spec?.[specKey]));
};

export const getMigrationPolicyBooleanSortValue = (
  policy: V1alpha1MigrationPolicy,
  specKey: MigrationPolicyBooleanSpecKey,
): number => (policy?.spec?.[specKey] ? 1 : 0);

export const getBandwidthPerMigrationText = (bandwidth: number | string): string => {
  if (typeof bandwidth === 'string') return readableSizeUnit(bandwidth);
  return `${bandwidth}`;
};

export const getMigrationPolicyBandwidthDisplayValue = (
  policy: V1alpha1MigrationPolicy,
): string => {
  if (!(migrationPolicySpecKeys.BANDWIDTH_PER_MIGRATION in (policy?.spec || {}))) {
    return NO_DATA_DASH;
  }

  const bandwidth = policy.spec?.bandwidthPerMigration;
  return bandwidth == null ? NO_DATA_DASH : getBandwidthPerMigrationText(bandwidth);
};

export const getCompletionTimeoutText = (completionTimeout: number | undefined): string =>
  completionTimeout !== undefined ? `${completionTimeout} sec` : NO_DATA_DASH;

export const getMigrationPolicyCompletionTimeoutDisplayValue = (
  policy: V1alpha1MigrationPolicy,
): string => {
  if (!(migrationPolicySpecKeys.COMPLETION_TIMEOUT_PER_GIB in (policy?.spec || {}))) {
    return NO_DATA_DASH;
  }

  return getCompletionTimeoutText(policy.spec?.completionTimeoutPerGiB);
};

type MigrationPolicySort = NonNullable<ColumnConfig<V1alpha1MigrationPolicy>['sort']>;

export const sortByMigrationPolicyBoolean =
  (specKey: MigrationPolicyBooleanSpecKey): MigrationPolicySort =>
  (data, direction) =>
    [...data].sort((a, b) => {
      const cmp =
        getMigrationPolicyBooleanSortValue(a, specKey) -
        getMigrationPolicyBooleanSortValue(b, specKey);
      return direction === SortByDirection.asc ? cmp : -cmp;
    });

export const sortByCompletionTimeout: MigrationPolicySort = (data, direction) =>
  [...data].sort((a, b) => {
    const aVal = a?.spec?.completionTimeoutPerGiB ?? 0;
    const bVal = b?.spec?.completionTimeoutPerGiB ?? 0;
    const cmp = aVal - bVal;
    return direction === SortByDirection.asc ? cmp : -cmp;
  });

export const getEmptyMigrationPolicy = (): V1alpha1MigrationPolicy => ({
  apiVersion: `${MigrationPolicyModel.apiGroup}/${MigrationPolicyModel.apiVersion}`,
  kind: MigrationPolicyModel.kind,
  metadata: { annotations: {} },
  spec: { selectors: {} },
});

export const getMigrationPolicyURL = (name: string, cluster?: string): string =>
  getClusterResourceRoute({
    ...(cluster !== undefined && { cluster }),
    model: modelToGroupVersionKind(MigrationPolicyModel) as ExtensionK8sModel,
    name,
  });
