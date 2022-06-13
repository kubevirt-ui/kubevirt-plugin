import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';

export const defaultVMTemplateYamlTemplate = `
apiVersion: ${TemplateModel.apiGroup}/${TemplateModel.apiVersion}
kind: ${TemplateModel.kind}
metadata:
  name: vm-template-example
  labels:
    template.kubevirt.io/type: vm
    os.template.kubevirt.io/fedora36: 'true'
    workload.template.kubevirt.io/server: 'true'
  annotations:
    name.os.template.kubevirt.io/fedora36: Fedora 36
    description: VM template example
objects:
  - apiVersion: kubevirt.io/v1
    kind: VirtualMachine
    metadata:
      name: '\${NAME}'
      annotations:
        description: VM example
      labels:
        app: '\${NAME}'
        vm.kubevirt.io/template: vm-template-example
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
            kubevirt.io/domain: '\${NAME}'
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
            resources:
              requests:
                memory: 2Gi
          hostname: '\${NAME}'
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
                  password: '\${CLOUD_USER_PASSWORD}'
                  chpasswd: { expire: False }
              name: cloudinitdisk
parameters:
  - name: NAME
    description: Name for the new VM
    required: true
  - name: CLOUD_USER_PASSWORD
    description: Randomized password for the cloud-init user
    generate: expression
    from: '[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}'
`;
