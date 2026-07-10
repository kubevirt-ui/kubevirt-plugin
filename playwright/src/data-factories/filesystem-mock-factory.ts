/**
 * Factory for generating mocked VMI filesystemlist API responses.
 * Used to test the StorageUtil component's handling of the filesystemlist
 * subresource API (CNV-80854) without requiring a connected guest agent.
 */

export interface FilesystemItem {
  diskName: string;
  fileSystemType: string;
  mountPoint: string;
  totalBytes: number;
  usedBytes: number;
}

export interface FilesystemListResponse {
  items: FilesystemItem[];
}

const SNAP_PACKAGES = [
  { name: 'core20', version: '1623', size: 65_536_000 },
  { name: 'lxd', version: '22753', size: 89_128_960 },
  { name: 'snapd', version: '17336', size: 52_428_800 },
  { name: 'core20', version: '1695', size: 65_536_000 },
  { name: 'lxd', version: '23541', size: 91_226_112 },
  { name: 'snapd', version: '17576', size: 52_428_800 },
  { name: 'core22', version: '278', size: 73_400_320 },
  { name: 'firefox', version: '2088', size: 209_715_200 },
  { name: 'gnome-42', version: '98', size: 167_772_160 },
  { name: 'gtk-common', version: '13', size: 12_582_912 },
  { name: 'bare', version: '5', size: 4_096 },
];

/**
 * Build a filesystemlist response that mimics an Ubuntu VM with snap packages.
 * Exceeds the old guestosinfo 10-item cap to reproduce the CNV-80854 scenario.
 *
 * @param snapCount - Number of squashfs snap mounts to include (default: 11)
 * @param rootDiskSizeGiB - Root disk total size in GiB (default: 30)
 * @param rootDiskUsedGiB - Root disk used size in GiB (default: 5)
 */
export function createUbuntuLikeFilesystemList(
  snapCount = SNAP_PACKAGES.length,
  rootDiskSizeGiB = 30,
  rootDiskUsedGiB = 5,
): FilesystemListResponse {
  const GiB = 1_073_741_824;
  const items: FilesystemItem[] = [
    {
      diskName: 'vda1',
      mountPoint: '/',
      fileSystemType: 'ext4',
      totalBytes: rootDiskSizeGiB * GiB,
      usedBytes: rootDiskUsedGiB * GiB,
    },
    {
      diskName: 'vda15',
      mountPoint: '/boot/efi',
      fileSystemType: 'vfat',
      totalBytes: 109_422_592,
      usedBytes: 6_258_688,
    },
  ];

  for (let i = 0; i < Math.min(snapCount, SNAP_PACKAGES.length); i++) {
    const snap = SNAP_PACKAGES[i];
    items.push({
      diskName: `loop${i}`,
      mountPoint: `/snap/${snap.name}/${snap.version}`,
      fileSystemType: 'squashfs',
      totalBytes: snap.size,
      usedBytes: snap.size,
    });
  }

  return { items };
}
