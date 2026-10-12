export function buildVmYaml(vmName: string, namespace: string): string {
  return `apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: ${vmName}
  namespace: ${namespace}
  labels:
    app: ${vmName}
spec:
  running: true
  template:
    metadata:
      labels:
        kubevirt.io/domain: ${vmName}
    spec:
      domain:
        devices:
          disks:
            - disk:
                bus: virtio
              name: containerdisk
          interfaces:
            - masquerade: {}
              name: default
        resources:
          requests:
            memory: 512Mi
      networks:
        - name: default
          pod: {}
      volumes:
        - containerDisk:
            image: registry.redhat.io/rhel9/rhel-guest-image
          name: containerdisk`;
}
