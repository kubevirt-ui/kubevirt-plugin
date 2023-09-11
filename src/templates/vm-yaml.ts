import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';

export const defaultVMYamlTemplate = `
apiVersion: ${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}
kind: ${VirtualMachineModel.kind}
metadata:
  name: example
  annotations:
    description: VM example
  labels:
    app: example
    os.template.kubevirt.io/fedora36: 'true'
spec:
  running: false
  template:
    metadata:
      annotations:
        vm.kubevirt.io/flavor: small
        vm.kubevirt.io/os: fedora36
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
        features:
          acpi: {}
          smm:
            enabled: true
        firmware:
          bootloader:
            efi: {}
        machine:
          type: q35
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
            image: 'quay.io/containerdisks/fedora:36'
        - cloudInitNoCloud:
            userData: |-
              #cloud-config
              user: fedora
              password: fedora
              chpasswd: { expire: False }
          name: cloudinitdisk
`;
