import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';

export const defaultVirtualMachineClusterInstancetypeYamlTemplate = `
apiVersion: ${VirtualMachineClusterInstancetypeModel.apiGroup}/${VirtualMachineClusterInstancetypeModel.apiVersion}
kind: ${VirtualMachineClusterInstancetypeModel.kind}
metadata:
  name: example
  namespace: default
spec: 
  cpu:
    guest: 1
  memory:
    guest: 1Gi
`;
