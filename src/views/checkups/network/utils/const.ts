import { isUpstream } from '@kubevirt-utils/utils/utils';

export const UPSTREAM_NETWORK_CHECKUP_IMAGE_NAME = 'kubevirt-vm-latency';
export const UPSTREAM_NETWORK_CHECKUP_IMAGE =
  'quay.io/repository/kiagnose/kubevirt-vm-latency:main';
export const DOWNSTREAM_NETWORK_CHECKUP_IMAGE_NAME = 'vm-network-latency-checkup-rhel9';
export const DOWNSTREAM_NETWORK_CHECKUP_IMAGE =
  'registry.redhat.io/container-native-virtualization/vm-network-latency-checkup-rhel9:v4.19';
export const networkCheckupImageSettings = isUpstream
  ? {
      fallback: UPSTREAM_NETWORK_CHECKUP_IMAGE,
      name: UPSTREAM_NETWORK_CHECKUP_IMAGE_NAME,
    }
  : {
      fallback: DOWNSTREAM_NETWORK_CHECKUP_IMAGE,
      name: DOWNSTREAM_NETWORK_CHECKUP_IMAGE_NAME,
    };
