import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';

export const defaultVMTemplateYamlTemplate = `
apiVersion: ${TemplateModel.apiGroup}/${TemplateModel.apiVersion}
kind: ${TemplateModel.kind}
metadata:
  name: example
  labels:
    template.kubevirt.io/type: vm
    os.template.kubevirt.io/fedora: 'true'
    workload.template.kubevirt.io/server: 'true'
  annotations:
    name.os.template.kubevirt.io/fedora: Fedora 
    description: VM template example
    openshift.io/display-name: "Fedora VM"
    iconClass: icon-fedora
objects:
  - apiVersion: kubevirt.io/v1
    kind: VirtualMachine
    metadata:
      name: '\${NAME}'
      annotations:
        description: VM example
      labels:
        app: '\${NAME}'
        vm.kubevirt.io/template: example
        os.template.kubevirt.io/fedora: 'true'
    spec:
      running: false
      template:
        metadata:
          annotations:
            vm.kubevirt.io/flavor: small
            vm.kubevirt.io/os: fedora
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
            memory:
              guest: 2Gi
          hostname: '\${NAME}'
          networks:
            - name: default
              pod: {}
          terminationGracePeriodSeconds: 180
          volumes:
            - name: rootdisk
              containerDisk:
                image: 'quay.io/containerdisks/fedora'
            - cloudInitNoCloud:
                userData: |-
                  #cloud-config
                  user: fedora
                  password: '\${CLOUD_USER_PASSWORD}'
                  chpasswd: { expire: False }
              name: cloudinitdisk
parameters:
  - name: NAME
    description: Name for the new VM
    generate: expression
    from: 'example-[a-z0-9]{16}'
  - name: CLOUD_USER_PASSWORD
    description: Randomized password for the cloud-init user
    generate: expression
    from: '[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}'
`;
