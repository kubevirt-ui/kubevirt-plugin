// Read-only compressed filesystems (e.g. snap loop devices on Ubuntu)
// that should not count toward writable storage utilization.
export const EXCLUDED_FILESYSTEM_TYPES = ['squashfs'];
