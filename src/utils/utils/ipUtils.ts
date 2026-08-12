import * as ipaddr from 'ipaddr.js';

import { type IPAddress } from './types';

/**
 * Link-local address prefix (fe80::/10)
 * @see https://www.rfc-editor.org/rfc/rfc4291#section-2.5.6
 */
// eslint-disable-next-line -- sonarjs/no-hardcoded-ip
export const IPV6_LINK_LOCAL_CIDR = 'fe80::/10';

export const isIPV6LinkLocal = (ipAddr: string): boolean => {
  if (!ipaddr.IPv6.isValid(ipAddr)) {
    return false;
  }
  return ipaddr.parse(ipAddr).match(ipaddr.parseCIDR(IPV6_LINK_LOCAL_CIDR));
};

export const removeLinkLocalIPV6 = (ipAddress: IPAddress[]): IPAddress[] =>
  ipAddress.filter((item) => !isIPV6LinkLocal(item?.ip?.trim()));
