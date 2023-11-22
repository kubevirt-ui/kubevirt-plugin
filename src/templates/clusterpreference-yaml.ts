import VirtualMachineClusterPreferenceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterPreferenceModel';

export const defaultVirtualMachineClusterPreferenceYamlTemplate = `
apiVersion: ${VirtualMachineClusterPreferenceModel.apiGroup}/${VirtualMachineClusterPreferenceModel.apiVersion}
kind: ${VirtualMachineClusterPreferenceModel.kind}
metadata:
  name: example
  annotations:
    openshift.io/display-name: Fedora
spec: 
  devices:
    preferredDiskBus: virtio
    preferredInterfaceModel: virtio
    preferredNetworkInterfaceMultiQueue: true
    preferredRng: {}
  features:
    preferredSmm: {}
  firmware:
    preferredUseEfi: true
    preferredUseSecureBoot: true
  requirements:
    cpu:
      guest: 1
    memory:
      guest: 2Gi
`;
