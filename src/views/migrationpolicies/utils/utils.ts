import { getI18n } from 'react-i18next';

import MigrationPolicyModel from '@kubevirt-ui/kubevirt-api/console/models/MigrationPolicyModel';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

const i18n = getI18n();

export const getBooleanText = (value: boolean): string => (value ? i18n.t('YES') : i18n.t('NO'));

export const getBandwidthPerMigrationText = (bandwidth: string | number): string | number => {
  if (!bandwidth || bandwidth === '0') return i18n.t('Unlimited') as string;
  if (typeof bandwidth === 'string') return readableSizeUnit(bandwidth);
  return bandwidth;
};

export const getCompletionTimeoutText = (completionTimeout: number): string =>
  completionTimeout ? `${completionTimeout} sec` : NO_DATA_DASH;

export const getEmptyMigrationPolicy = (): V1alpha1MigrationPolicy => ({
  apiVersion: `${MigrationPolicyModel.apiGroup}/${MigrationPolicyModel.apiVersion}`,
  kind: MigrationPolicyModel.kind,
  metadata: { annotations: {} },
  spec: { selectors: {} },
});
