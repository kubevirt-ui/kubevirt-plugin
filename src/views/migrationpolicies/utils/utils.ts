import { MigrationPolicyModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { getClusterResourceRoute } from '@multicluster/urls';
import { type ExtensionK8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const getBooleanText = (value: boolean): string => (value ? t('Yes') : t('No'));

export const getBandwidthPerMigrationText = (bandwidth: number | string): string => {
  if (typeof bandwidth === 'string') return readableSizeUnit(bandwidth);
  return `${bandwidth}`;
};

export const getCompletionTimeoutText = (completionTimeout: number | undefined): string =>
  completionTimeout != null ? `${completionTimeout} sec` : NO_DATA_DASH;

export const getEmptyMigrationPolicy = (): V1alpha1MigrationPolicy => ({
  apiVersion: `${MigrationPolicyModel.apiGroup}/${MigrationPolicyModel.apiVersion}`,
  kind: MigrationPolicyModel.kind,
  metadata: { annotations: {} },
  spec: { selectors: {} },
});

export const getMigrationPolicyURL = (name: string, cluster?: string): string =>
  getClusterResourceRoute({
    cluster,
    model: modelToGroupVersionKind(MigrationPolicyModel) as ExtensionK8sModel,
    name,
  });
