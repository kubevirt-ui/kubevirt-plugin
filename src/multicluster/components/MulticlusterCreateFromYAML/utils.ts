import { defaultMigrationPolicyYamlTemplate } from 'src/templates/migrationpolicy-yaml';

import MigrationPolicyModel from '@kubevirt-ui/kubevirt-api/console/models/MigrationPolicyModel';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const getDefaultResource = (model: K8sModel) => {
  if (model.kind === MigrationPolicyModel.kind) return defaultMigrationPolicyYamlTemplate;
};
