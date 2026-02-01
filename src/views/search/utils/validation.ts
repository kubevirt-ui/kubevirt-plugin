export const isValidIPv4Substring = (ip: string) => {
  // Invalid characters || consecutive dots
  if (!/^[0-9.]*$/.test(ip) || /\.\./.test(ip)) {
    return false;
  }

  const octets = ip.split('.');
  if (octets.length > 4) {
    return false;
  }

  return octets
    .filter((o) => o !== '')
    .every((o) => {
      const num = parseInt(o, 10);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
};

export const isValidIPv6Substring = (ip: string) => {
  // Invalid characters || more than 2 consecutive colons || more than one ::
  if (!/^[0-9a-fA-F:]*$/.test(ip) || /:::/.test(ip) || (ip.match(/::/g) ?? []).length > 1) {
    return false;
  }

  const groups = ip.split(':');
  if (groups.length > 8) {
    return false;
  }

  return groups.every((group) => group.length <= 4);
};

export const isValidIPSubstring = (ip: string) =>
  !ip || isValidIPv4Substring(ip) || isValidIPv6Substring(ip);
