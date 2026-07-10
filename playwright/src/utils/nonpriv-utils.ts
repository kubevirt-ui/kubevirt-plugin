/**
 * Utilities for non-privileged user test setup and teardown.
 *
 * Centralises logic referenced from multiple rule-engine rules so the
 * rules themselves stay concise.
 */

import type KubernetesClient from '@/clients/kubernetes-client';

import { logger } from './logger';
import { MINUTE } from './test-config';

/**
 * Waits for the OpenShift OAuth server pods to finish rolling out after the
 * OAuth cluster resource has been patched (e.g. to add the htpasswd IDP).
 *
 * Records the current pod UIDs before waiting so it can detect the rollout
 * cycle: first waits until all pre-patch pods are gone, then waits for at
 * least one new Running+Ready pod. This prevents a false-positive where old
 * pods are already Ready before the new deployment starts.
 *
 * @param k8sClient - authenticated admin client
 * @param timeoutMs - how long to wait (default 3 min — typical OAuth rollout)
 */
export async function waitForOAuthRollout(
  k8sClient: KubernetesClient,
  timeoutMs = 3 * MINUTE,
): Promise<void> {
  const NAMESPACE = 'openshift-authentication';
  const deadline = Date.now() + timeoutMs;

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  /** Poll with exponential backoff, returning the first interval for the next call. */
  const nextBackoff = (current: number, min = 500, max = 10_000) =>
    Math.min(current * 2, max) + Math.random() * min;

  logger.info(
    `⏳ Waiting for OAuth pods in ${NAMESPACE} to be Ready (timeout: ${timeoutMs / 1000}s)...`,
  );

  // Snapshot UIDs of pods that exist right now (pre-rollout).
  let preRolloutUids = new Set<string>();
  try {
    const existing = await k8sClient.getCoreV1Api().listNamespacedPod({ namespace: NAMESPACE });
    preRolloutUids = new Set(
      (existing.items ?? []).map((p) => p.metadata?.uid ?? '').filter(Boolean),
    );
  } catch {
    // If we can't snapshot, fall through to the ready-pod check below.
  }

  // Phase 1: wait until at least one pre-rollout pod is gone (rollout started).
  // Starts at 500ms and backs off quickly — pod termination is usually fast.
  if (preRolloutUids.size > 0) {
    let delay = 500;
    while (Date.now() < deadline) {
      try {
        const podList = await k8sClient.getCoreV1Api().listNamespacedPod({ namespace: NAMESPACE });
        const currentUids = new Set(
          (podList.items ?? []).map((p) => p.metadata?.uid ?? '').filter(Boolean),
        );
        if (![...preRolloutUids].some((uid) => currentUids.has(uid))) break;
      } catch {
        // Transient — keep polling
      }
      await sleep(delay);
      delay = nextBackoff(delay, 500, 5_000);
    }
  }

  // Phase 2: wait until at least one new (post-rollout) Running+Ready pod exists.
  // Starts at 1s (pods need a moment to initialise) and backs off up to 10s.
  let delay = 1_000;
  while (Date.now() < deadline) {
    try {
      const podList = await k8sClient.getCoreV1Api().listNamespacedPod({ namespace: NAMESPACE });
      const newReadyPods = (podList.items ?? []).filter((pod) => {
        if (preRolloutUids.has(pod.metadata?.uid ?? '')) return false;
        if (pod.status?.phase !== 'Running') return false;
        const ready = (pod.status?.conditions ?? []).find((c) => c.type === 'Ready');
        return ready?.status === 'True';
      });

      if (newReadyPods.length > 0) {
        logger.success(
          `✓ OAuth pod(s) ready: ${newReadyPods.map((p) => p.metadata?.name).join(', ')}`,
        );
        return;
      }
    } catch {
      // Transient API error — keep polling
    }

    await sleep(delay);
    delay = nextBackoff(delay, 1_000, 10_000);
  }

  logger.warn(
    `⚠️ OAuth rollout did not complete within ${timeoutMs / 1000}s. ` +
      `Login may fail if the IDP was newly added — re-run after pods stabilise.`,
  );
}

/**
 * Revokes the cluster-level ClusterRoleBinding that `grantUserClusterViewAccess`
 * created for the non-priv test user.
 *
 * The binding name follows the same deterministic pattern as the grant method
 * so the two are always in sync.
 *
 * Safe to call even if the binding does not exist (404 is silently ignored).
 *
 * @param k8sClient - authenticated admin client
 * @param username  - non-priv username (default: 'test')
 */
export async function revokeNonPrivClusterViewAccess(
  k8sClient: KubernetesClient,
  username: string,
): Promise<void> {
  const bindingName = `test-user-cluster-view-${username
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()}`;
  await k8sClient.deleteClusterRoleBinding(bindingName);
  logger.info(`✓ Revoked ClusterRoleBinding "${bindingName}" for non-priv user "${username}"`);

  const cdiBindingName = `test-user-cdi-reader-${username
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()}`;
  await k8sClient.deleteClusterRoleBinding(cdiBindingName);
  logger.info(
    `✓ Revoked CDI ClusterRoleBinding "${cdiBindingName}" for non-priv user "${username}"`,
  );
}

const HTPASSWD_SECRET = 'htpasswd-secret';
const OPENSHIFT_CONFIG_NS = 'openshift-config';
export const NONPRIV_IDP_NAME = 'test-users';
const IDP_NAME = NONPRIV_IDP_NAME;

/** Silently swallow 404 errors — the resource is already gone. */
function ignore404(err: unknown): void {
  const e = err as {
    body?: { code?: number };
    code?: number;
    response?: { statusCode?: number };
    statusCode?: number;
  };
  const code = e.statusCode ?? e.response?.statusCode ?? e.code ?? e.body?.code;
  if (code === 404) return;
  throw err;
}

/**
 * Full teardown of the non-priv test user and its supporting cluster resources.
 *
 * Removes (in order):
 *   1. Namespace RoleBindings created by setup (`test-user-admin`, `test-user-kubevirt-edit`)
 *   2. Cluster-level ClusterRoleBindings (via `revokeNonPrivClusterViewAccess`)
 *   3. OpenShift Identity and User objects
 *   4. The user's key in the `kubevirt-user-settings` ConfigMap
 *   5. The htpasswd secret in `openshift-config`
 *   6. The `test-users` HTPasswd IDP from the OAuth cluster resource
 *
 * Every step is idempotent — safe to call even if the user was partially or
 * never provisioned. Errors on individual steps are logged and do not abort
 * the remaining cleanup.
 */
export async function removeNonPrivUser(
  k8sClient: KubernetesClient,
  username: string,
  testNamespace: string,
  cnvNamespace: string,
): Promise<void> {
  // 1. Namespace RoleBindings
  const nsBindings = ['test-user-admin', 'test-user-kubevirt-edit'];
  for (const name of nsBindings) {
    try {
      await k8sClient.rbacApi.deleteNamespacedRoleBinding({ name, namespace: testNamespace });
      logger.info(`✓ Deleted RoleBinding ${name} in ${testNamespace}`);
    } catch (err) {
      try {
        ignore404(err);
      } catch {
        logger.warn(`⚠️ Failed to delete RoleBinding ${name}: ${err}`);
      }
    }
  }

  // 2. Cluster-level ClusterRoleBindings
  try {
    await revokeNonPrivClusterViewAccess(k8sClient, username);
  } catch (err) {
    logger.warn(`⚠️ Failed to revoke cluster view access: ${err}`);
  }

  // 3. Identity + User
  try {
    await k8sClient.customObjectsApi.deleteClusterCustomObject({
      group: 'user.openshift.io',
      version: 'v1',
      plural: 'identities',
      name: `${IDP_NAME}:${username}`,
    });
    logger.info(`✓ Deleted Identity ${IDP_NAME}:${username}`);
  } catch (err) {
    try {
      ignore404(err);
    } catch {
      logger.warn(`⚠️ Failed to delete Identity: ${err}`);
    }
  }

  try {
    await k8sClient.customObjectsApi.deleteClusterCustomObject({
      group: 'user.openshift.io',
      version: 'v1',
      plural: 'users',
      name: username,
    });
    logger.info(`✓ Deleted User ${username}`);
  } catch (err) {
    try {
      ignore404(err);
    } catch {
      logger.warn(`⚠️ Failed to delete User: ${err}`);
    }
  }

  // 4. kubevirt-user-settings ConfigMap — remove the user's key
  try {
    await k8sClient.coreV1Api.patchNamespacedConfigMap({
      name: 'kubevirt-user-settings',
      namespace: cnvNamespace,
      body: [{ op: 'remove', path: `/data/${username}` }],
    });
    logger.info(`✓ Removed "${username}" key from kubevirt-user-settings`);
  } catch (err) {
    try {
      ignore404(err);
    } catch {
      logger.warn(`⚠️ Failed to patch kubevirt-user-settings: ${err}`);
    }
  }

  // 5. htpasswd secret
  try {
    await k8sClient.deleteSecret(HTPASSWD_SECRET, OPENSHIFT_CONFIG_NS);
    logger.info(`✓ Deleted secret ${HTPASSWD_SECRET} in ${OPENSHIFT_CONFIG_NS}`);
  } catch (err) {
    try {
      ignore404(err);
    } catch {
      logger.warn(`⚠️ Failed to delete htpasswd secret: ${err}`);
    }
  }

  // 6. Remove the test-users IDP from the OAuth cluster resource
  try {
    interface OAuthSpec {
      spec?: { identityProviders?: Array<{ name: string; type: string }> };
    }
    const oauthRaw = await k8sClient.customObjectsApi.getClusterCustomObject({
      group: 'config.openshift.io',
      version: 'v1',
      plural: 'oauths',
      name: 'cluster',
    });
    const unwrapped = oauthRaw as OAuthSpec | { body?: OAuthSpec };
    const oauth: OAuthSpec | undefined =
      'spec' in unwrapped ? unwrapped : (unwrapped as { body?: OAuthSpec }).body;

    const idps = oauth?.spec?.identityProviders ?? [];
    const filtered = idps.filter((idp) => idp.name !== IDP_NAME);

    if (filtered.length < idps.length) {
      const patchOp =
        filtered.length > 0
          ? [{ op: 'replace' as const, path: '/spec/identityProviders', value: filtered }]
          : [{ op: 'remove' as const, path: '/spec/identityProviders' }];

      await k8sClient.customObjectsApi.patchClusterCustomObject({
        group: 'config.openshift.io',
        version: 'v1',
        plural: 'oauths',
        name: 'cluster',
        body: patchOp,
      });
      logger.info(`✓ Removed "${IDP_NAME}" IDP from OAuth cluster config`);
    }
  } catch (err) {
    logger.warn(`⚠️ Failed to remove IDP from OAuth: ${err}`);
  }
}
