import { applyManifest, deleteResource, oc, ocIgnore } from './oc';

/** Create a bridge-type NetworkAttachmentDefinition for multus secondary NICs. */
export function createBridgeNAD(ns: string, nadName: string, bridge = 'br0') {
  const cniConfig = JSON.stringify({
    bridge,
    cniVersion: '0.3.1',
    macspoofchk: false,
    name: nadName,
    type: 'bridge',
  });

  applyManifest(`
apiVersion: k8s.cni.cncf.io/v1
kind: NetworkAttachmentDefinition
metadata:
  name: ${nadName}
  namespace: ${ns}
spec:
  config: '${cniConfig}'
`);
}

/**
 * Create a running VM with a pod default NIC and a bridge multus secondary NIC.
 * Uses a blank DataVolume, matching other e2e helpers (containerDisk is not supported).
 */
export function createVMWithBridgeMultusNIC(
  vmName: string,
  ns: string,
  nadName: string,
  nicName = 'secondary-nic',
) {
  ocIgnore(`delete vm ${vmName} -n ${ns} --ignore-not-found`);

  applyManifest(`
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: ${vmName}
  namespace: ${ns}
spec:
  dataVolumeTemplates:
    - metadata:
        name: ${vmName}-volume
      spec:
        source:
          blank: {}
        storage:
          resources:
            requests:
              storage: 3Gi
  runStrategy: Always
  template:
    spec:
      domain:
        devices:
          autoattachPodInterface: false
          disks:
            - disk:
                bus: virtio
              name: rootdisk
          interfaces:
            - masquerade: {}
              model: virtio
              name: default
            - bridge: {}
              model: virtio
              name: ${nicName}
        memory:
          guest: 512Mi
      networks:
        - name: default
          pod: {}
        - multus:
            networkName: ${ns}/${nadName}
          name: ${nicName}
      volumes:
        - dataVolume:
            name: ${vmName}-volume
          name: rootdisk
`);
}

/** Wait until the VM printable status is Running. */
export function waitForVMRunning(vmName: string, ns: string, timeout = '10m') {
  const timeoutMs = timeout.endsWith('m') ? parseInt(timeout, 10) * 60_000 + 60_000 : 660_000;

  oc(
    `wait vm/${vmName} -n ${ns} --for=jsonpath='{.status.printableStatus}'=Running --timeout=${timeout}`,
    { timeout: timeoutMs },
  );
}

/** Wait until the VM has a MigrationRequired condition with status True. */
export function waitForMigrationRequired(vmName: string, ns: string, timeout = '5m') {
  const timeoutMs = timeout.endsWith('m') ? parseInt(timeout, 10) * 60_000 + 60_000 : 360_000;

  oc(`wait vm/${vmName} -n ${ns} --for=condition=MigrationRequired --timeout=${timeout}`, {
    timeout: timeoutMs,
  });
}

/** Point the multus secondary NIC at a different NAD to trigger live-update migration. */
export function patchVMMultusNAD(vmName: string, ns: string, nadName: string, networkIndex = 1) {
  oc(
    `patch vm ${vmName} -n ${ns} --type=json -p '[{"op":"replace","path":"/spec/template/spec/networks/${networkIndex}/multus/networkName","value":"${ns}/${nadName}"}]'`,
  );
}

export function cleanupMigrationRequiredTestResources(
  vmName: string,
  ns: string,
  nadNames: string[],
) {
  deleteResource('vm', vmName, ns);
  nadNames.forEach((nad) => deleteResource('network-attachment-definition', nad, ns));
}
