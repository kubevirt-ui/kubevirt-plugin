export const moveFirstDeviceDown = (devices: string[]): string[] => {
  if (devices.length < 2) return [...devices];

  return [devices[1], devices[0], ...devices.slice(2)];
};

// The Customization summary adds " (NIC)" to network device names, while the
// Boot order modal uses bare names. Normalize names before comparing the two.
const stripNicSuffix = (deviceName: string): string => deviceName.replace(/ \(NIC\)$/, '');

export const normalizeBootOrder = (devices: string[]): string[] => devices.map(stripNicSuffix);
