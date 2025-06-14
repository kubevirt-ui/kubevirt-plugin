import { VMINetworkPresentation } from '@kubevirt-utils/resources/vmi/types';

import { NetworkPresentation } from './constants';

export enum NetworkInterfaceState {
  'ABSENT' = 'absent',
  'DOWN' = 'down',
  'NONE' = 'none',
  'UNSUPPORTED' = 'unsupported',
  'UP' = 'up',
}
export type NicState = {
  config?: NetworkPresentation;
  runtime: VMINetworkPresentation;
};
