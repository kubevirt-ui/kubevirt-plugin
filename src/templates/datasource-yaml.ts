import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';

export const defaultDataSourceYamlTemplate = `
apiVersion: ${DataSourceModel.apiGroup}/${DataSourceModel.apiVersion}
kind: ${DataSourceModel.kind}
metadata:
  name: example
  namespace: default
spec: {
    source: {}
}`;
