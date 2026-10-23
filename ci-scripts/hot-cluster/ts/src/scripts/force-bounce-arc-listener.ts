/**
 * Force the ARC listener pod to be recreated, for force_arc_reinstall.
 *
 * `helm upgrade --install` (install-runner-scale-set.ts) is idempotent: if
 * nothing in the chart's values actually changed since the last install,
 * Helm correctly no-ops and leaves the existing listener Pod completely
 * untouched. That means "force_arc_reinstall" alone does NOT guarantee a
 * fresh listener -- confirmed live: a listener pod's name was identical
 * before and after a forced helm upgrade, and the stale GitHub-side
 * registration persisted (Execute tests stayed queued with zero runners
 * ever registered, even after the "reinstall").
 *
 * Deleting the listener Pod directly is the actual fix: the
 * gha-runner-scale-set-controller watches each AutoscalingListener object
 * and recreates its Pod as soon as it's gone, establishing a brand new
 * connection/registration to GitHub -- this is the standard upstream
 * troubleshooting step for a listener that looks Ready but isn't actually
 * working. See ci-scripts/hot-cluster/arc/README.md.
 *
 * This is a forced recovery path -- if the bounce itself fails (API error,
 * RBAC, delete rejected, etc.), that failure must surface and fail the job
 * rather than being swallowed, otherwise the job would sail through to
 * "Execute tests" having silently done nothing, reproducing the exact
 * hang this script exists to fix. Expected non-errors:
 *   - No AutoscalingListener yet (brand-new install creates it fresh).
 *   - NotFound on read/delete: the Helm upgrade that just ran (or the
 *     controller) already removed the pod. 
 *
 * The replacement Pod keeps the *same name* (it's named after the
 * AutoscalingListener object, not given a random suffix), and a
 * Terminating pod commonly still reports phase=Running with its last-known
 * containerStatuses[].ready=true for part of its grace period. So success
 * is only reported once a pod with a *different* UID under that same name
 * is confirmed Running and Ready -- otherwise the later "Verify cluster
 * health" check could read the old, still-terminating pod and report a
 * false-positive "healthy listener", silently defeating this whole fix.
 * When the old pod vanished before we captured a UID, any Ready pod under
 * that name counts as the replacement.
 *
 * Required env: RUNNER_SCALE_SET_NAME
 * Optional env: ARC_CONTROLLER_NS (default: arc-systems), ARC_RUNNERS_NS (default: arc-runners)
 */

import { findArcListenerPodName, isPodReady, type PodStatusLike } from '../arc-listener';
import { KubeClient, requireEnv, sleep } from '../kube-client';
import { isNotFoundError } from '../retry';

const REPLACEMENT_POLL_INTERVAL_MS = 5000;
const REPLACEMENT_TIMEOUT_MS = 2 * 60 * 1000;

const waitForReplacementPod = async (
  client: KubeClient,
  params: { namespace: string; podName: string; previousUid: string },
): Promise<void> => {
  const { namespace, podName, previousUid } = params;
  const deadline = Date.now() + REPLACEMENT_TIMEOUT_MS;

  for (;;) {
    try {
      const pod = (await client.coreV1.readNamespacedPod({
        name: podName,
        namespace,
      })) as unknown as PodStatusLike;

      const uid = pod.metadata?.uid;
      const replaced = Boolean(uid) && (previousUid === '' || uid !== previousUid);
      if (replaced && isPodReady(pod)) {
        return;
      }
    } catch {
      // Briefly gone while being recreated by the controller -- keep polling.
    }

    if (Date.now() >= deadline) {
      throw new Error(
        previousUid
          ? `Timed out after ${REPLACEMENT_TIMEOUT_MS}ms waiting for a new, Ready listener pod named '${podName}' to replace uid '${previousUid}'`
          : `Timed out after ${REPLACEMENT_TIMEOUT_MS}ms waiting for a Ready listener pod named '${podName}'`,
      );
    }
    await sleep(Math.min(REPLACEMENT_POLL_INTERVAL_MS, deadline - Date.now()));
  }
};

const main = async (): Promise<void> => {
  const scaleSetName = requireEnv('RUNNER_SCALE_SET_NAME');
  const controllerNamespace = process.env.ARC_CONTROLLER_NS ?? 'arc-systems';
  const scaleSetNamespace = process.env.ARC_RUNNERS_NS ?? 'arc-runners';

  const client = KubeClient.fromKubeconfig();
  const podName = await findArcListenerPodName(client, {
    controllerNamespace,
    scaleSetName,
    scaleSetNamespace,
  });

  if (!podName) {
    console.log(
      `No AutoscalingListener found for scale set '${scaleSetName}' -- nothing to bounce (the install above will create it fresh).`,
    );
    return;
  }

  let previousUid = '';
  try {
    const previousPod = (await client.coreV1.readNamespacedPod({
      name: podName,
      namespace: controllerNamespace,
    })) as unknown as PodStatusLike;
    previousUid = previousPod.metadata?.uid ?? '';
    if (!previousUid) {
      throw new Error(
        `Listener pod '${podName}' has no UID -- cannot verify it was actually replaced`,
      );
    }
  } catch (err) {
    if (!isNotFoundError(err)) {
      throw err;
    }
    console.log(
      `Listener pod '${podName}' already gone before delete (likely removed during Helm upgrade) -- waiting for its replacement...`,
    );
  }

  if (previousUid) {
    console.log(
      `Deleting listener pod '${podName}' (uid ${previousUid}) in '${controllerNamespace}' to force a fresh GitHub registration...`,
    );
    try {
      await client.coreV1.deleteNamespacedPod({
        name: podName,
        namespace: controllerNamespace,
      });
    } catch (err) {
      if (!isNotFoundError(err)) {
        throw err;
      }
      // Helm upgrade / controller often deletes the listener between our
      // read and delete. Gone is the desired state.
      console.log(
        `Listener pod '${podName}' already gone on delete (404) -- continuing to wait for replacement...`,
      );
    }
  }

  console.log(`Waiting up to ${REPLACEMENT_TIMEOUT_MS / 1000}s for its replacement to become Ready...`);
  await waitForReplacementPod(client, {
    namespace: controllerNamespace,
    podName,
    previousUid,
  });

  console.log(
    `Replacement listener pod '${podName}' is Running and Ready -- the ARC controller established a new connection to GitHub.`,
  );
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
