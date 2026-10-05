/**
 * Check whether the existing ARC runner scale set's listener is already
 * healthy, so ibmc-cluster-setup.yml can skip bouncing ARC on an
 * already-running cluster (every VPC/classic E2E run otherwise reaches
 * this job, since probe-cluster-dns.ts never short-circuits for those
 * infra types -- only "Check for existing ROKS cluster" does, and only
 * for cluster creation, not the ARC install steps). Repeatedly bouncing a
 * healthy listener mid-queue is how "Execute tests" jobs end up queued
 * forever with no runner ever claiming them -- see
 * https://github.com/kubevirt-ui/kubevirt-plugin/actions/runs/37301023503/job/111736216051.
 *
 * Any lookup failure is treated as "not ready" (safe default: fall back
 * to reinstalling ARC) rather than failing this job.
 *
 * Required env: RUNNER_SCALE_SET_NAME
 * Optional env: ARC_CONTROLLER_NS (default: arc-systems), ARC_RUNNERS_NS (default: arc-runners)
 * Output: listener_ready=true|false
 */

import { checkArcListenerReady } from '../arc-listener';
import { KubeClient, requireEnv } from '../kube-client';
import { setOutput } from '../utils';

const main = async (): Promise<void> => {
  const scaleSetName = requireEnv('RUNNER_SCALE_SET_NAME');
  const controllerNamespace = process.env.ARC_CONTROLLER_NS ?? 'arc-systems';
  const scaleSetNamespace = process.env.ARC_RUNNERS_NS ?? 'arc-runners';

  try {
    const client = KubeClient.fromKubeconfig();
    const health = await checkArcListenerReady(client, {
      controllerNamespace,
      scaleSetName,
      scaleSetNamespace,
    });
    console.log(`ARC listener health for '${scaleSetName}': ${health.detail}`);
    setOutput('listener_ready', String(health.ready));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`::warning::Could not verify ARC listener health, assuming not ready: ${msg}`);
    setOutput('listener_ready', 'false');
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
