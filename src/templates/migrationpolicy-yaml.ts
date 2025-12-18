import { MigrationPolicyModel } from '@kubevirt-ui-ext/kubevirt-api/console';

export const defaultMigrationPolicyYamlTemplate = `
apiVersion: ${MigrationPolicyModel.apiGroup}/${MigrationPolicyModel.apiVersion}
kind: ${MigrationPolicyModel.kind}
metadata:
  name: example
spec: 
  selectors: {}
`;
