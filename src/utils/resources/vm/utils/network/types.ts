import { VMINetworkPresentation } from '@kubevirt-utils/resources/vmi/types';

import { NetworkPresentation } from './constants';

export enum NetworkInterfaceState {
  'ABSENT' = 'absent',
  'DOWN' = 'down',
  'NONE' = 'none',
  'UNSUPPORTED' = 'unsupported',
  'UP' = 'up',
}
export type NICState = {
  config?: NetworkPresentation;
  runtime: VMINetworkPresentation;
};
