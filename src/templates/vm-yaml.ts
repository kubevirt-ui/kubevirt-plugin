import { generateCloudInitPassword } from '@catalog/CreateFromInstanceTypes/utils/utils';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { isUpstream } from '@kubevirt-utils/utils/utils';

const osType = isUpstream ? 'fedora' : 'rhel10';
const image = isUpstream
  ? 'quay.io/containerdisks/fedora'
  : 'registry.redhat.io/rhel10/rhel-guest-image';

export const defaultVMYamlTemplate = () => `apiVersion: ${VirtualMachineModel.apiGroup}/${
  VirtualMachineModel.apiVersion
}
kind: ${VirtualMachineModel.kind}
metadata:
  name: example
  annotations:
    description: VM example
  labels:
    app: example
    os.template.kubevirt.io/${osType}: 'true'
spec:
  runStrategy: Halted
  template:
    metadata:
      annotations:
        vm.kubevirt.io/flavor: small
        vm.kubevirt.io/os: ${osType}
        vm.kubevirt.io/workload: server
      labels:
        kubevirt.io/domain: example
        kubevirt.io/size: small
    spec:
      domain:
        cpu:
          cores: 1
          sockets: 1
          threads: 1
        devices:
          disks:
            - disk:
                bus: virtio
              name: rootdisk
            - disk:
                bus: virtio
              name: cloudinitdisk
          interfaces:
            - masquerade: {}
              model: virtio
              name: default
          networkInterfaceMultiqueue: true
          rng: {}
        memory:
          guest: 2Gi
      hostname: example
      networks:
        - name: default
          pod: {}
      terminationGracePeriodSeconds: 180
      volumes:
        - name: rootdisk
          containerDisk:
            image: ${image}
        - cloudInitNoCloud:
            userData: |-
              #cloud-config
              user: ${osType}
              password: ${generateCloudInitPassword()}
              chpasswd: { expire: False }
          name: cloudinitdisk
`;
