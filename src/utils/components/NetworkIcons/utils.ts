import { TFunction } from 'react-i18next';

import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';

import LinkStateAbsentIcon from './LinkStateAbsentIcon';
import LinkStateDownIcon from './LinkStateDownIcon';
import LinkStateNoDataIcon from './LinkStateNoDataIcon';
import LinkStateUnsupportedIcon from './LinkStateUnsupportedIcon';
import LinkStateUpIcon from './LinkStateUpIcon';

export const interfaceStateIcons = {
  [NetworkInterfaceState.ABSENT]: LinkStateAbsentIcon,
  [NetworkInterfaceState.DOWN]: LinkStateDownIcon,
  [NetworkInterfaceState.NONE]: LinkStateNoDataIcon,
  [NetworkInterfaceState.UNSUPPORTED]: LinkStateUnsupportedIcon,
  [NetworkInterfaceState.UP]: LinkStateUpIcon,
};

export const getNetworkInterfaceStateIcon = (
  interfaceState: NetworkInterfaceState,
): typeof interfaceStateIcons[keyof typeof interfaceStateIcons] =>
  interfaceStateIcons[interfaceState] ?? LinkStateNoDataIcon;

export const describeNetworkState = (t: TFunction, state: NetworkInterfaceState) => {
  switch (state) {
    case NetworkInterfaceState.ABSENT:
      return t('Hot-unplugged');
    case NetworkInterfaceState.UP:
      return t('Up');
    case NetworkInterfaceState.DOWN:
      return t('Down');
    case NetworkInterfaceState.UNSUPPORTED:
      return t('Unsupported');
    case NetworkInterfaceState.NONE:
    default:
      return t('None');
  }
};
