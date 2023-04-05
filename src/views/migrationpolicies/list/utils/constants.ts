import { MigrationPolicyModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const migrationPoliciesPageBaseURL = `/k8s/cluster/${MigrationPolicyModelRef}`;

export const createItems = {
  form: t('With form'),
  yaml: t('With YAML'),
};
