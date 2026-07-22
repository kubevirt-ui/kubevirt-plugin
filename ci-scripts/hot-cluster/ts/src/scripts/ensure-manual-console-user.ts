/**
 * Ensure an htpasswd identity provider exists on the cluster,
 * upsert a user + password, and grant cluster-admin.
 * Replaces: ci-scripts/manual-console/ensure-manual-console-user.sh
 *
 * Usage:
 *   echo <password> | npx tsx src/scripts/ensure-manual-console-user.ts <username>
 *   npx tsx src/scripts/ensure-manual-console-user.ts --remove <username>
 *
 * Note: still uses `htpasswd` binary for bcrypt hashing and `oc` for
 * OAuth config patching (the OAuth CR has complex merge semantics).
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { KubeClient } from '../kube-client';

const main = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const client = KubeClient.fromKubeconfig();
  const coreApi = client.coreV1;

  if (args[0] === '--remove') {
    const username = args[1];
    if (!username) {
      console.error('Usage: ensure-manual-console-user.ts --remove <username>');
      process.exit(1);
    }

    console.log(`Removing htpasswd user '${username}'...`);

    try {
      const { data } = await coreApi.readNamespacedSecret({ name: 'htpass-secret', namespace: 'openshift-config' });
      const existingHtpasswd = Buffer.from(data?.['htpasswd'] ?? '', 'base64').toString('utf8');
      const updated = existingHtpasswd
        .split('\n')
        .filter((line) => {
          const [user] = line.split(':');
          return user !== username && line.trim() !== '';
        })
        .join('\n');

      execSync(
        `oc create secret generic htpass-secret --from-literal=htpasswd='${updated}' -n openshift-config --dry-run=client -o yaml | oc apply -f -`,
        { stdio: 'inherit' },
      );
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode !== 404) throw err;
      console.log('htpass-secret not found; nothing to remove.');
    }

    execSync(`oc adm policy remove-cluster-role-from-user cluster-admin "${username}"`, { stdio: 'inherit' });
    console.log(`User '${username}' removed.`);
    return;
  }

  const username = args[0];
  if (!username) {
    console.error('Usage: ensure-manual-console-user.ts <username> (password via stdin)');
    process.exit(1);
  }

  const password = readFileSync(0, 'utf8').trim();
  if (!password) {
    console.error('ERROR: password not provided on stdin');
    process.exit(1);
  }

  console.log(`Ensuring htpasswd user '${username}'...`);

  // Get existing htpasswd data
  let existingHtpasswd = '';
  try {
    const { data } = await coreApi.readNamespacedSecret({ name: 'htpass-secret', namespace: 'openshift-config' });
    existingHtpasswd = Buffer.from(data?.['htpasswd'] ?? '', 'base64').toString('utf8');
  } catch { /* doesn't exist yet */ }

  // Generate new hash using htpasswd binary
  const newHash = execSync(`printf '%s' '${password}' | htpasswd -niB '${username}'`, { encoding: 'utf8' }).trim();

  // Update: remove existing entry for this user, append new hash
  const updated = existingHtpasswd
    .split('\n')
    .filter((line) => {
      const [user] = line.split(':');
      return user !== username && line.trim() !== '';
    })
    .concat([newHash])
    .filter(Boolean)
    .join('\n');

  execSync(
    `oc create secret generic htpass-secret --from-literal=htpasswd='${updated}' -n openshift-config --dry-run=client -o yaml | oc apply -f -`,
    { stdio: 'inherit' },
  );

  // Check if htpasswd IDP exists
  let hasHtpasswdIdp = '';
  try {
    hasHtpasswdIdp = execSync(
      "oc get oauth cluster -o jsonpath='{.spec.identityProviders[?(@.type==\"HTPasswd\")].name}'",
      { encoding: 'utf8' },
    ).trim();
  } catch { /* no IDP yet */ }

  if (!hasHtpasswdIdp) {
    console.log('Adding htpasswd identity provider to cluster OAuth config...');
    execSync(
      `oc get oauth cluster -o json | jq '.spec.identityProviders += [{"name":"htpasswd","mappingMethod":"claim","type":"HTPasswd","htpasswd":{"fileData":{"name":"htpass-secret"}}}]' | oc apply -f -`,
      { stdio: 'inherit' },
    );

    console.log('Waiting for OAuth pods to roll out...');
    try {
      execSync('oc rollout status deployment/oauth-openshift -n openshift-authentication --timeout=120s', { stdio: 'inherit' });
    } catch {
      console.warn('WARN: OAuth rollout did not complete within 120s');
    }
  } else {
    console.log(`htpasswd identity provider '${hasHtpasswdIdp}' already present.`);
  }

  console.log(`Granting cluster-admin to ${username}...`);
  execSync(`oc adm policy add-cluster-role-to-user cluster-admin "${username}"`, { stdio: 'pipe' });

  // Extract CA bundle
  const caCertFile = join(tmpdir(), `ca-cert-${Date.now()}.pem`);
  const caCert = execSync("oc get configmap kube-root-ca.crt -n default -o jsonpath='{.data.ca\\.crt}'", { encoding: 'utf8' });
  if (!caCert) {
    console.error('ERROR: could not read CA bundle from kube-root-ca.crt');
    process.exit(1);
  }
  writeFileSync(caCertFile, caCert);

  console.log(`User '${username}' ready with cluster-admin access.`);
  console.log(`CA_CERT_FILE=${caCertFile}`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
