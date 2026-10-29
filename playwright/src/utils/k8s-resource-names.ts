/** DNS-1123 subdomain — safe for StorageClass.metadata.name (no shell/YAML metacharacters). */
const STORAGE_CLASS_NAME = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/i;

export function assertValidStorageClassName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 253 || !STORAGE_CLASS_NAME.test(trimmed)) {
    throw new Error(`Invalid storageClassName for E2E: "${name}"`);
  }
  return trimmed;
}
