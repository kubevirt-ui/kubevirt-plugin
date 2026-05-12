import { execSync, ExecSyncOptions } from 'child_process';

const DEFAULT_OPTS: ExecSyncOptions = { stdio: 'pipe', timeout: 300_000 };

/** Run an `oc` command and return stdout as a string. Throws on non-zero exit. */
export function oc(cmd: string, opts?: ExecSyncOptions): string {
  return execSync(`oc ${cmd}`, { ...DEFAULT_OPTS, ...opts })
    .toString()
    .trim();
}

/** Run an `oc` command, ignoring errors (returns empty string on failure). */
export function ocIgnore(cmd: string): string {
  try {
    return oc(cmd);
  } catch {
    return '';
  }
}

/** Wait for a VM to reach a specific condition. */
export function waitForVM(name: string, ns: string, condition: string, timeout = '300s') {
  oc(`wait vm/${name} -n ${ns} --for=condition=${condition} --timeout=${timeout}`);
}

/** Wait for a jsonpath field on a resource to equal an expected value. */
export function waitForJsonpath(
  resource: string,
  ns: string,
  jsonpath: string,
  value: string,
  timeout = '30s',
) {
  oc(`wait ${resource} -n ${ns} --for=jsonpath='${jsonpath}'=${value} --timeout=${timeout}`);
}

/** Apply a Kubernetes manifest from a heredoc string. */
export function applyManifest(yaml: string) {
  execSync('oc apply -f -', { ...DEFAULT_OPTS, input: yaml });
}

/** Delete a resource, ignoring not-found errors. */
export function deleteResource(kind: string, name: string, ns?: string) {
  const nsFlag = ns ? `-n ${ns}` : '';
  ocIgnore(`delete ${kind} ${name} ${nsFlag} --ignore-not-found --wait=false`);
}

/** Patch a VirtualMachine's run strategy. */
export function patchVMRunStrategy(name: string, ns: string, strategy: 'Always' | 'Halted') {
  oc(`patch vm ${name} -n ${ns} --type=merge -p '{"spec":{"runStrategy":"${strategy}"}}'`);
}

/** Create (or replace) a minimal example VirtualMachine using applyManifest. */
export function createExampleVM(
  vmName: string,
  ns: string,
  runStrategy: 'Always' | 'Halted' = 'Halted',
) {
  ocIgnore(`delete vm ${vmName} -n ${ns} --ignore-not-found`);

  applyManifest(`
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: ${vmName}
  namespace: ${ns}
  labels:
    app: ${vmName}
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
  runStrategy: ${runStrategy}
  template:
    metadata:
      labels:
        kubevirt.io/domain: ${vmName}
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
      hostname: ${vmName}
      networks:
        - name: default
          pod: {}
      terminationGracePeriodSeconds: 180
      volumes:
        - dataVolume:
            name: ${vmName}-volume
          name: rootdisk
        - cloudInitNoCloud:
            userData: |
              #cloud-config
              user: rhel10
              password: test-password
              chpasswd: {expire: false}
          name: cloudinitdisk
`);
}
