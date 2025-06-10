import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { isUpstream } from '@kubevirt-utils/utils/utils';

const randomPassword = Math.random().toString(36).slice(-6);

const type = isUpstream ? 'fedora' : 'rhel10';
const password = isUpstream ? 'fedora' : randomPassword;

export const defaultVMYamlTemplate = `apiVersion: ${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}
kind: ${VirtualMachineModel.kind}
metadata:
  name: example
  annotations:
    description: VM example
  labels:
    app: example
    os.template.kubevirt.io/${type}: 'true'
spec:
  runStrategy: Halted
  template:
    metadata:
      annotations:
        vm.kubevirt.io/flavor: small
        vm.kubevirt.io/os: ${type}
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
            image: 'quay.io/containerdisks/${type}'
        - cloudInitNoCloud:
            userData: |-
              #cloud-config
              user: ${type}
              password: ${password}
              chpasswd: { expire: False }
          name: cloudinitdisk
`;
