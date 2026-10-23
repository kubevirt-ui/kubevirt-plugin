/**
 * Probe whether the cluster can host an HTPasswd OAuth identity provider.
 *
 * VPC ROKS (Hypershift HCP) locks the guest OAuth CR via ValidatingAdmissionPolicy
 * so identityProviders must be set on the HostedCluster. Manual console's
 * per-deploy htpasswd user path needs either:
 *   - an HTPasswd IDP already present that reads htpass-secret, or
 *   - a mutable OAuth CR (IPI / classic ROKS)
 *
 * When neither is true, callers should fall back to auth-mode=disabled.
 *
 * CLI: writes available=true|false and reason=... to GITHUB_OUTPUT.
 */

import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { setOutput } from '../utils';

export type HtpasswdIdpAvailability =
  | { available: true; reason: 'idp-present' | 'oauth-mutable' }
  | {
      available: false;
      reason: 'htpasswd-secret-mismatch' | 'oauth-immutable' | 'oauth-unreadable';
    };

export type OauthIdentityProvider = {
  htpasswd?: { fileData?: { name?: string } };
  type?: string;
};

type ExecFn = (command: string) => string;

/** Secret name ensure-manual-console-user.sh upserts into. */
export const HTPASSWD_SECRET_NAME = 'htpass-secret';

/** Probe payload used by the dry-run OAuth patch (must touch .spec to hit VAP). */
export const HTPASSWD_IDP_PROBE_PATCH = JSON.stringify({
  spec: {
    identityProviders: [
      {
        name: 'htpasswd',
        mappingMethod: 'claim',
        type: 'HTPasswd',
        htpasswd: { fileData: { name: HTPASSWD_SECRET_NAME } },
      },
    ],
  },
});

export const isOauthImmutableDenial = (message: string): boolean =>
  /ValidatingAdmissionPolicy/i.test(message) || /HostedCluster object/i.test(message);

/**
 * RBAC denials on OAuth get/patch. The ARC runner intentionally cannot read
 * oauths / openshift-config secrets (those stay with ci-env-controller so
 * htpasswd credentials are never readable from the runner SA). Treat that as
 * "HTPasswd unavailable" and fall back to auth-mode=disabled rather than
 * failing the deploy.
 */
export const isOauthAccessDenied = (message: string): boolean =>
  /\bForbidden\b/i.test(message) || /\bUnauthorized\b/i.test(message);

/** Classify HTPasswd IDPs against the Secret our ensure path writes. */
export const classifyHtpasswdIdpSecrets = (
  providers: OauthIdentityProvider[],
  secretName: string = HTPASSWD_SECRET_NAME,
): 'match' | 'mismatch' | 'none' => {
  const htpasswdProviders = providers.filter((provider) => provider.type === 'HTPasswd');
  if (htpasswdProviders.length === 0) {
    return 'none';
  }
  if (
    htpasswdProviders.some((provider) => provider.htpasswd?.fileData?.name === secretName)
  ) {
    return 'match';
  }
  return 'mismatch';
};

export const parseIdentityProviders = (raw: string): OauthIdentityProvider[] => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return Array.isArray(parsed) ? (parsed as OauthIdentityProvider[]) : [];
  } catch {
    return [];
  }
};

/** Pure interpreter for unit tests. */
export const interpretHtpasswdProbe = (opts: {
  getErrorMessage?: string;
  identityProviders?: OauthIdentityProvider[];
  patchErrorMessage?: string;
  patchSucceeded: boolean;
}): HtpasswdIdpAvailability => {
  if (opts.getErrorMessage) {
    if (isOauthAccessDenied(opts.getErrorMessage)) {
      return { available: false, reason: 'oauth-unreadable' };
    }
    throw new Error(`Unexpected OAuth get failure: ${opts.getErrorMessage}`);
  }

  const htpasswdClass = classifyHtpasswdIdpSecrets(opts.identityProviders ?? []);
  if (htpasswdClass === 'match') {
    return { available: true, reason: 'idp-present' };
  }
  if (htpasswdClass === 'mismatch') {
    // ensure-manual-console-user only upserts htpass-secret; a different
    // fileData.name would accept logins against credentials we never write.
    return { available: false, reason: 'htpasswd-secret-mismatch' };
  }
  if (opts.patchSucceeded) {
    return { available: true, reason: 'oauth-mutable' };
  }
  if (opts.patchErrorMessage && isOauthImmutableDenial(opts.patchErrorMessage)) {
    return { available: false, reason: 'oauth-immutable' };
  }
  if (opts.patchErrorMessage && isOauthAccessDenied(opts.patchErrorMessage)) {
    return { available: false, reason: 'oauth-unreadable' };
  }
  throw new Error(
    `Unexpected OAuth probe failure: ${opts.patchErrorMessage ?? 'unknown error'}`,
  );
};

const defaultExec: ExecFn = (command) => {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    const e = err as { message?: string; stderr?: string; stdout?: string };
    const detail = [e.stderr, e.stdout, e.message].filter(Boolean).join('\n');
    throw new Error(detail || String(err));
  }
};

export const probeHtpasswdIdpAvailability = (
  exec: ExecFn = defaultExec,
): HtpasswdIdpAvailability => {
  let identityProviders: OauthIdentityProvider[];
  try {
    identityProviders = parseIdentityProviders(
      exec(`oc get oauth cluster -o jsonpath='{.spec.identityProviders}'`),
    );
  } catch (err) {
    const getErrorMessage = err instanceof Error ? err.message : String(err);
    return interpretHtpasswdProbe({
      getErrorMessage,
      patchSucceeded: false,
    });
  }

  const htpasswdClass = classifyHtpasswdIdpSecrets(identityProviders);

  if (htpasswdClass !== 'none') {
    return interpretHtpasswdProbe({
      identityProviders,
      patchSucceeded: true,
    });
  }

  try {
    exec(
      `oc patch oauth cluster --type=merge --dry-run=server -p '${HTPASSWD_IDP_PROBE_PATCH}'`,
    );
    return interpretHtpasswdProbe({ identityProviders: [], patchSucceeded: true });
  } catch (err) {
    const patchErrorMessage = err instanceof Error ? err.message : String(err);
    return interpretHtpasswdProbe({
      identityProviders: [],
      patchErrorMessage,
      patchSucceeded: false,
    });
  }
};

const main = (): void => {
  const result = probeHtpasswdIdpAvailability();
  setOutput('available', result.available ? 'true' : 'false');
  setOutput('reason', result.reason);
  if (result.available) {
    console.log(`HTPasswd IDP available (${result.reason})`);
    return;
  }
  if (result.reason === 'htpasswd-secret-mismatch') {
    console.log(
      `::warning::HTPasswd identity provider exists but does not use Secret ` +
        `'${HTPASSWD_SECRET_NAME}'. Manual console will use auth-mode=disabled.`,
    );
    return;
  }
  if (result.reason === 'oauth-unreadable') {
    console.log(
      `::warning::Runner cannot read/patch OAuth CR (expected: no oauths RBAC on ` +
        `the ARC runner SA, so htpasswd credentials stay with ci-env-controller). ` +
        `Manual console will use auth-mode=disabled (no login wall; console SA token).`,
    );
    return;
  }
  console.log(
    `::warning::OAuth CR is immutable (VPC ROKS / Hypershift HCP). ` +
      `Manual console will use auth-mode=disabled (no login wall; console SA token).`,
  );
};

const isDirectRun =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    main();
  } catch (err) {
    console.error(`::error::${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}
