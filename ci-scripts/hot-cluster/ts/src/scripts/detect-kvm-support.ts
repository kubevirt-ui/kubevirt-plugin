/**
 * Detect KVM support on worker nodes by checking for vmx/svm CPU flags
 * and /dev/kvm device availability.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Env: KVM_EMULATION_INPUT (fallback value from workflow inputs)
 * Output: kvm_emulation=true|false
 */

import { appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const exec = (cmd: string): string => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
};

const setOutput = (value: string): void => {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) appendFileSync(outputFile, `kvm_emulation=${value}\n`);
};

const main = (): void => {
  const kvmFallback = process.env.KVM_EMULATION_INPUT ?? 'true';

  console.log('Checking for /dev/kvm on worker nodes...');

  let workerNode = exec(
    "oc get nodes --no-headers -l node-role.kubernetes.io/worker 2>/dev/null | head -1 | awk '{print $1}'",
  );

  if (!workerNode) {
    console.log('No worker nodes found, checking control plane nodes...');
    workerNode = exec("oc get nodes --no-headers 2>/dev/null | head -1 | awk '{print $1}'");
  }

  if (!workerNode) {
    console.log(
      `::warning::No nodes available to check KVM. Using input kvm_emulation=${kvmFallback}`,
    );
    setOutput(kvmFallback);
    return;
  }

  console.log(`Checking /dev/kvm on node ${workerNode} (60s timeout)...`);

  const cpuinfo = exec(`timeout 60 oc debug "node/${workerNode}" -- cat /proc/cpuinfo 2>&1`);
  if (/vmx|svm/.test(cpuinfo)) {
    console.log('/dev/kvm support detected (CPU has vmx/svm flags)');
    setOutput('false');
    return;
  }

  const devKvm = exec(`timeout 30 oc debug "node/${workerNode}" -- ls -la /dev/kvm 2>&1`);
  if (devKvm.includes('kvm')) {
    console.log('/dev/kvm device found');
    setOutput('false');
    return;
  }

  console.log(
    `::warning::/dev/kvm not detected or check timed out. Falling back to input: kvm_emulation=${kvmFallback}`,
  );
  setOutput(kvmFallback);
};

main();
