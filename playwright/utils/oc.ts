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

/** Apply a Kubernetes manifest from a heredoc string. */
export function applyManifest(yaml: string) {
  execSync(`echo '${yaml.replace(/'/g, "'\\''")}' | oc apply -f -`, DEFAULT_OPTS);
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
