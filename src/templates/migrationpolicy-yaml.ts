import MigrationPolicyModel from '@kubevirt-ui/kubevirt-api/console/models/MigrationPolicyModel';

export const defaultMigrationPolicyYamlTemplate = `
apiVersion: ${MigrationPolicyModel.apiGroup}/${MigrationPolicyModel.apiVersion}
kind: ${MigrationPolicyModel.kind}
metadata:
  name: example
spec: 
  selectors: {}
`;
