import VirtualMachineInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstancetypeModel';

export const defaultVirtualMachineInstancetypeYamlTemplate = `
apiVersion: ${VirtualMachineInstancetypeModel.apiGroup}/${VirtualMachineInstancetypeModel.apiVersion}
kind: ${VirtualMachineInstancetypeModel.kind}
metadata:
  name: example
spec: 
  cpu:
    guest: 1
  memory:
    guest: 2Gi
`;
