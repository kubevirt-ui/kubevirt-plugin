import MigrationPolicyModel from '@kubevirt-ui/kubevirt-api/console/models/MigrationPolicyModel';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

export const getBooleanText = (value: boolean): string => (value ? t('Yes') : t('No'));

export const getBandwidthPerMigrationText = (bandwidth: string | number): string => {
  if (typeof bandwidth === 'string') return readableSizeUnit(bandwidth);
  return `${bandwidth}`;
};

export const getCompletionTimeoutText = (completionTimeout: number): string =>
  completionTimeout !== undefined ? `${completionTimeout} sec` : NO_DATA_DASH;

export const getEmptyMigrationPolicy = (): V1alpha1MigrationPolicy => ({
  apiVersion: `${MigrationPolicyModel.apiGroup}/${MigrationPolicyModel.apiVersion}`,
  kind: MigrationPolicyModel.kind,
  metadata: { annotations: {} },
  spec: { selectors: {} },
});
