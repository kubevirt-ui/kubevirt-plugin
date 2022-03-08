import { V1Interface } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { NO_DATA_DASH } from '../constants';

import { interfacesTypes } from './constants';

export const getNetworkInterfaceType = (iface: V1Interface): string => {
  const drive = Object.keys(interfacesTypes).find((ifaceType: string) => iface?.[ifaceType]);
  return drive ?? NO_DATA_DASH;
};

export const getPrintableNetworkInterfaceType = (iface: V1Interface): string =>
  interfacesTypes[getNetworkInterfaceType(iface)];
