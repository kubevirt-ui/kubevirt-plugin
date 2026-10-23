/**
 * Delete a ROKS cluster on job failure or cancellation, then wait until IBM
 * Cloud confirms it is fully gone. `cluster rm` itself returns in seconds,
 * well before worker VSIs are detached from the VPC subnet -- without this
 * wait, a following VPC resource sweep races the still-draining IKS worker
 * nodes and fails to delete the subnet/VPC
 * (subnet_in_use_iks_worker_node_exists).
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME
 *
 * Lessons from stuck delete_failed / deleting ghosts:
 * - Delete by cluster **ID** (`-c <id>`), not only by name -- more reliable
 *   once the record is in delete_failed with master already deleted.
 * - Re-issue `ks cluster rm` while the record remains (especially
 *   delete_failed); a single OK does not mean the control-plane name is
 *   gone, and a later retry often finishes the tombstone after VPC/worker
 *   holds are cleared.
 */

import { execFileSync } from 'node:child_process';

import { requireEnv, sleep } from '../kube-client';

const POLL_INTERVAL_MS = 30_000;
const POLL_BUDGET_MS = 40 * 60 * 1000;

// Substring IBM Cloud CLI prints when the cluster genuinely doesn't exist.
// Any other failure (network blip, auth hiccup, rate limit, ...) must NOT
// be treated as "cluster is gone" -- that would skip deletion entirely or
// end the drain-wait poll early while the cluster (and its worker nodes
// holding the VPC subnet) is still very much there.
const CLUSTER_NOT_FOUND_ERROR = 'could not be found';

type ClusterInfo = {
  id: string;
  name: string;
  state: string;
};

const isNotFoundOutput = (output: string): boolean => output.includes(CLUSTER_NOT_FOUND_ERROR);

const getCluster = (clusterRef: string): ClusterInfo | 'not-found' | 'unknown' => {
  try {
    // execFileSync: CLUSTER_NAME / id must never be interpolated into a shell.
    const raw = execFileSync(
      'ibmcloud',
      ['ks', 'cluster', 'get', '--cluster', clusterRef, '--output', 'json'],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    const json = JSON.parse(raw) as { id?: string; name?: string; state?: string };
    if (!json.id) {
      console.log(
        `WARNING: 'ibmcloud ks cluster get' returned JSON without an id for '${clusterRef}'; treating as still present.`,
      );
      return 'unknown';
    }
    return {
      id: json.id,
      name: json.name ?? clusterRef,
      state: json.state ?? 'unknown',
    };
  } catch (err) {
    const execErr = err as { stderr?: string; stdout?: string };
    const output = `${execErr.stdout ?? ''}${execErr.stderr ?? ''}`;
    if (isNotFoundOutput(output)) {
      return 'not-found';
    }
    console.log(
      `WARNING: 'ibmcloud ks cluster get' failed with an unexpected error; assuming the cluster still exists:\n${output || String(err)}`,
    );
    return 'unknown';
  }
};

/**
 * Request deletion by ID. Documented flags are --delete-storage and
 * --delete-openshift-registry-cos-bucket; --force-delete-storage is a
 * legacy alias still accepted by current container-service plugins (and
 * what cleared delete_failed ghosts in practice alongside ID-based rm).
 */
const requestDeleteById = (clusterId: string): void => {
  try {
    execFileSync(
      'ibmcloud',
      [
        'ks',
        'cluster',
        'rm',
        '-c',
        clusterId,
        '-f',
        '--delete-storage',
        '--force-delete-storage',
        '--delete-openshift-registry-cos-bucket',
      ],
      {
        stdio: 'inherit',
      },
    );
  } catch {
    console.log(
      `WARNING: cluster deletion request for id '${clusterId}' failed (will retry while polling)`,
    );
  }
};

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');

  let info = getCluster(clusterName);
  if (info === 'not-found') {
    console.log(`Cluster '${clusterName}' not found, nothing to delete.`);
    return;
  }
  // Refuse to delete by name or to discover identity later: an ambiguous
  // initial lookup must not become `ks cluster rm -c <name>`, and a later
  // name hit could be a different cluster created by a concurrent retest.
  if (info === 'unknown') {
    console.error(
      `::error::Cannot delete cluster '${clusterName}': initial lookup did not return a confirmed id. Refusing to delete by name.`,
    );
    process.exit(1);
  }

  // Lock this confirmed id for the whole run; never retarget.
  const clusterId = info.id;
  console.log(`Deleting ROKS cluster '${clusterName}' (id=${info.id}, state=${info.state})...`);
  requestDeleteById(clusterId);

  console.log(
    `Waiting up to ${POLL_BUDGET_MS / 60_000} minutes for cluster '${clusterName}' to be fully removed (re-issuing rm by id while it stays in deleting/delete_failed)...`,
  );
  const deadline = Date.now() + POLL_BUDGET_MS;
  while (Date.now() < deadline) {
    await sleep(Math.min(POLL_INTERVAL_MS, deadline - Date.now()));

    info = getCluster(clusterName);
    if (info !== 'not-found' && info !== 'unknown' && info.id !== clusterId) {
      // Name reused by a different cluster -- do not delete it.
      const byId = getCluster(clusterId);
      if (byId === 'not-found') {
        console.log(
          `Original cluster id '${clusterId}' is gone; name '${clusterName}' now belongs to '${info.id}'. Stopping.`,
        );
        return;
      }
      console.error(
        `::error::Name '${clusterName}' now resolves to id '${info.id}', not original deletion target '${clusterId}' (state=${byId === 'unknown' ? 'unknown' : byId.state}). Stopping to avoid deleting a different cluster.`,
      );
      process.exit(1);
    }
    if (info === 'not-found') {
      // Confirm by retained id -- name can 404 briefly while the id record
      // still exists.
      const byId = getCluster(clusterId);
      if (byId !== 'not-found') {
        console.log(
          `Name lookup miss but id '${clusterId}' still present (state=${byId === 'unknown' ? 'unknown' : byId.state}); re-issuing rm...`,
        );
        requestDeleteById(clusterId);
        continue;
      }
      console.log(`Cluster '${clusterName}' is gone.`);
      return;
    }

    const state = info === 'unknown' ? 'unknown' : info.state;
    console.log(`Cluster still present (id=${clusterId}, state=${state}); re-issuing rm...`);
    requestDeleteById(clusterId);
  }

  console.log(
    `WARNING: cluster '${clusterName}' still present after ${POLL_BUDGET_MS / 60_000} minutes; continuing anyway -- the VPC sweep's own subnet/VPC retries will catch any lingering IKS worker nodes.`,
  );
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
