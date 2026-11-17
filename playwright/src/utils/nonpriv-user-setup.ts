/**
 * Non-priv test user provisioning (kubevirt-ui 5.0 `ensureNonPrivUserExists`).
 * Creates/updates htpasswd secret + `test-users` HTPasswd IDP on the cluster OAuth CR.
 */

import { createHash } from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { setTimeout as sleep } from 'node:timers/promises';

import { runOcCommand } from '@/utils/cluster-oc';
import { logger } from '@/utils/logger';
import { MINUTE } from '@/utils/test-config';

export const NONPRIV_IDP_NAME = 'test-users';
const HTPASSWD_SECRET = 'htpasswd-secret';
const OPENSHIFT_CONFIG_NS = 'openshift-config';
const OAUTH_AUTH_NS = 'openshift-authentication';

function htpasswdLine(username: string, password: string): string {
  const sha1Hash = createHash('sha1').update(password).digest('base64');
  return `${username}:{SHA}${sha1Hash}`;
}

function readHtpasswdFile(kubeconfig: string): string | undefined {
  try {
    const b64 = runOcCommand(
      `oc get secret ${HTPASSWD_SECRET} -n ${OPENSHIFT_CONFIG_NS} -o jsonpath='{.data.htpasswd}'`,
      kubeconfig,
    ).trim();
    if (!b64) {
      return undefined;
    }
    return Buffer.from(b64, 'base64').toString('utf8');
  } catch {
    return undefined;
  }
}

function writeHtpasswdSecret(content: string, kubeconfig: string): void {
  const tmp = path.join(os.tmpdir(), `pw-htpasswd-${Date.now()}`);
  fs.writeFileSync(tmp, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
  try {
    runOcCommand(
      `oc create secret generic ${HTPASSWD_SECRET} -n ${OPENSHIFT_CONFIG_NS} --from-file=htpasswd="${tmp}" --dry-run=client -o yaml | oc apply -f -`,
      kubeconfig,
      2 * MINUTE,
    );
  } finally {
    fs.unlinkSync(tmp);
  }
}

function oauthHasTestUsersIdp(kubeconfig: string): boolean {
  try {
    const raw = runOcCommand(`oc get oauth cluster -o json`, kubeconfig);
    const oauth = JSON.parse(raw) as {
      spec?: { identityProviders?: Array<{ name?: string; type?: string }> };
    };
    return (oauth.spec?.identityProviders ?? []).some(
      (idp) => idp.name === NONPRIV_IDP_NAME && idp.type === 'HTPasswd',
    );
  } catch {
    return false;
  }
}

function addTestUsersIdpToOAuth(kubeconfig: string): boolean {
  if (oauthHasTestUsersIdp(kubeconfig)) {
    return false;
  }
  const raw = runOcCommand(`oc get oauth cluster -o json`, kubeconfig);
  const oauth = JSON.parse(raw) as {
    spec?: { identityProviders?: Array<Record<string, unknown>> };
  };
  const idps = [...(oauth.spec?.identityProviders ?? [])];
  idps.push({
    htpasswd: { fileData: { name: HTPASSWD_SECRET } },
    name: NONPRIV_IDP_NAME,
    type: 'HTPasswd',
  });

  const hadProviders = oauth.spec?.identityProviders !== undefined;
  const patch = [
    { op: hadProviders ? 'replace' : 'add', path: '/spec/identityProviders', value: idps },
  ];
  const patchFile = path.join(os.tmpdir(), `pw-oauth-idp-${Date.now()}.json`);
  fs.writeFileSync(patchFile, JSON.stringify(patch), 'utf8');
  try {
    runOcCommand(
      `oc patch oauth cluster --type=json --patch-file="${patchFile}"`,
      kubeconfig,
      2 * MINUTE,
    );
  } finally {
    fs.unlinkSync(patchFile);
  }
  return true;
}

function removeStaleIdentities(username: string, kubeconfig: string): void {
  const expected = `${NONPRIV_IDP_NAME}:${username}`;
  try {
    const raw = runOcCommand(`oc get identities.user.openshift.io -o json`, kubeconfig);
    const list = JSON.parse(raw) as {
      items?: Array<{ metadata?: { name?: string }; user?: { name?: string } }>;
    };
    for (const id of list.items ?? []) {
      const idName = id.metadata?.name;
      if (!idName || id.user?.name !== username || idName === expected) {
        continue;
      }
      runOcCommand(`oc delete identity.user.openshift.io ${idName} --ignore-not-found`, kubeconfig);
      runOcCommand(`oc delete user ${username} --ignore-not-found`, kubeconfig);
      logger.info(`Removed stale identity ${idName} for user ${username}`);
    }
  } catch {
    // Best-effort — login will surface mapping errors if cleanup fails.
  }
}

/**
 * Ensures `test-users` htpasswd IDP exists and `username` is in the htpasswd secret.
 * @returns true when OAuth or htpasswd secret was changed (OAuth rollout may be required).
 */
export function ensureNonPrivUserExists(
  username: string,
  password: string,
  kubeconfig: string,
): boolean {
  let changed = false;
  const newLine = htpasswdLine(username, password);

  const existing = readHtpasswdFile(kubeconfig);
  if (existing === undefined) {
    writeHtpasswdSecret(`${newLine}\n`, kubeconfig);
    changed = true;
  } else {
    const lines = existing.split('\n');
    const idx = lines.findIndex((line) => line.startsWith(`${username}:`));
    let updated: string;
    if (idx === -1) {
      updated = `${existing.trimEnd()}\n${newLine}\n`;
      changed = true;
    } else if (lines[idx] !== newLine) {
      lines[idx] = newLine;
      updated = `${lines.join('\n').trimEnd()}\n`;
      changed = true;
    } else {
      updated = existing.endsWith('\n') ? existing : `${existing}\n`;
    }
    if (changed) {
      writeHtpasswdSecret(updated, kubeconfig);
    }
  }

  if (addTestUsersIdpToOAuth(kubeconfig)) {
    changed = true;
  }

  removeStaleIdentities(username, kubeconfig);
  return changed;
}

/** Wait for OAuth server deployment after IDP/htpasswd changes. */
export async function waitForOAuthRollout(
  kubeconfig: string,
  timeoutMs = 3 * MINUTE,
): Promise<void> {
  const timeoutSec = Math.max(30, Math.floor(timeoutMs / 1000));
  logger.info(`Waiting for OAuth rollout in ${OAUTH_AUTH_NS} (up to ${timeoutSec}s)...`);
  try {
    runOcCommand(
      `oc rollout status deployment/oauth-openshift -n ${OAUTH_AUTH_NS} --timeout=${timeoutSec}s`,
      kubeconfig,
      timeoutMs + 15_000,
    );
    logger.success('OAuth deployment rollout complete');
    return;
  } catch {
    // Some clusters use a different deployment name — poll Ready pods.
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const raw = runOcCommand(
        `oc get pods -n ${OAUTH_AUTH_NS} -l app=oauth-openshift -o json`,
        kubeconfig,
      );
      const pods = JSON.parse(raw) as {
        items?: Array<{
          status?: { conditions?: Array<{ status?: string; type?: string }>; phase?: string };
        }>;
      };
      const ready = (pods.items ?? []).some((pod) => {
        if (pod.status?.phase !== 'Running') {
          return false;
        }
        const cond = (pod.status?.conditions ?? []).find((c) => c.type === 'Ready');
        return cond?.status === 'True';
      });
      if (ready) {
        logger.success('OAuth pod(s) are Ready');
        return;
      }
    } catch {
      // keep polling
    }
    await sleep(2_000);
  }
  logger.warn('OAuth rollout did not complete in time — login may fail until pods stabilize');
}
