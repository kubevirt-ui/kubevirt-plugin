export const isValidIPv4Substring = (ipAddress: string): boolean => {
  // Invalid characters || consecutive dots
  if (!/^[0-9.]*$/.test(ipAddress) || /\.\./.test(ipAddress)) {
    return false;
  }

  const octets = ipAddress.split('.');
  if (octets.length > 4) {
    return false;
  }

  return octets
    .filter((octet) => octet !== '')
    .every((octet) => {
      const num = parseInt(octet, 10);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
};

export const isValidIPv6Substring = (ipAddress: string): boolean => {
  // Invalid characters || more than 2 consecutive colons || more than one ::
  if (
    !/^[0-9a-fA-F:]*$/.test(ipAddress) ||
    /:::/.test(ipAddress) ||
    (ipAddress.match(/::/g) ?? []).length > 1
  ) {
    return false;
  }

  const groups = ipAddress.split(':');
  if (groups.length > 8) {
    return false;
  }

  return groups.every((group) => group.length <= 4);
};

export const isValidIPSubstring = (ipAddress: string): boolean =>
  !ipAddress || isValidIPv4Substring(ipAddress) || isValidIPv6Substring(ipAddress);
