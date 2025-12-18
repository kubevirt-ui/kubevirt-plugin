import { VirtualMachineClusterInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';

export const defaultVirtualMachineClusterInstancetypeYamlTemplate = `
apiVersion: ${VirtualMachineClusterInstancetypeModel.apiGroup}/${VirtualMachineClusterInstancetypeModel.apiVersion}
kind: ${VirtualMachineClusterInstancetypeModel.kind}
metadata:
  name: example
spec: 
  cpu:
    guest: 1
  memory:
    guest: 2Gi
`;
