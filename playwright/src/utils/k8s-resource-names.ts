/** DNS-1123 subdomain — StorageClass.metadata.name. */
const STORAGE_CLASS_NAME = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/i;

/** DNS-1123 label — Namespace / most resource names passed to `oc`. */
const DNS1123_LABEL = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/i;

/** OpenShift identity / user names used in `oc get user` (conservative). */
const OPENSHIFT_USERNAME = /^[a-z0-9][a-z0-9._-]*$/i;

/** Console CSRF cookie value — block shell metacharacters in proxy headers. */
const CSRF_TOKEN = /^[A-Za-z0-9._~-]+$/;

export function assertValidStorageClassName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 253 || !STORAGE_CLASS_NAME.test(trimmed)) {
    throw new Error(`Invalid storageClassName for E2E: "${name}"`);
  }
  return trimmed;
}

export function assertValidK8sResourceName(name: string, field = 'resource name'): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 253 || !DNS1123_LABEL.test(trimmed)) {
    throw new Error(`Invalid Kubernetes ${field}: "${name}"`);
  }
  return trimmed;
}

export function assertValidK8sNamespace(name: string): string {
  return assertValidK8sResourceName(name, 'namespace');
}

/** OpenShift Identity.metadata.name (includes `idp:username`). */
const OPENSHIFT_IDENTITY_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._:@-]{0,253}$/;

export function assertValidOpenShiftIdentityName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || !OPENSHIFT_IDENTITY_NAME.test(trimmed)) {
    throw new Error(`Invalid OpenShift identity name for oc: "${name}"`);
  }
  return trimmed;
}

export function assertValidOpenShiftUsername(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 256 || !OPENSHIFT_USERNAME.test(trimmed)) {
    throw new Error(`Invalid OpenShift username for oc: "${name}"`);
  }
  return trimmed;
}

export function assertValidCsrfToken(token: string): string {
  const trimmed = token.trim();
  if (!trimmed || trimmed.length > 512 || !CSRF_TOKEN.test(trimmed)) {
    throw new Error('Invalid CSRF token from console session');
  }
  return trimmed;
}

export function assertValidClusterApiUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new Error(`Invalid CLUSTER_URL for oc login: "${url}"`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`CLUSTER_URL must use https: "${url}"`);
  }
  return parsed.toString().replace(/\/$/, '');
}
