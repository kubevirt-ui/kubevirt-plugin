/**
 * Extract a human-readable version from a container image string.
 * e.g. "registry.redhat.io/container-native-virtualization/virtio-win:v4.17.0-25" → "v4.17.0-25"
 * Returns undefined if no tag or digest suffix can be parsed.
 */
export const getVersionFromImage = (image?: string): string | undefined => {
  if (!image) return undefined;

  const atIndex = image.lastIndexOf('@');
  if (atIndex > 0) {
    const digest = image.substring(atIndex + 1);
    if (digest) return digest;
  }

  const colonIndex = image.lastIndexOf(':');
  if (colonIndex > 0) {
    const tag = image.substring(colonIndex + 1);
    if (tag && !tag.includes('/')) return tag;
  }

  return undefined;
};
