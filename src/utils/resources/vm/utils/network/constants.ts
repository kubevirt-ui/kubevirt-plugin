/* eslint-disable require-jsdoc */
import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export type NetworkPresentation = {
  iface: V1Interface;
  network: V1Network;
};

const typeHandler = {
  get(target, prop) {
    return target[prop] ?? target.bridge;
  },
};

const types = {
  bridge: 'bridge',
  masquerade: 'masquerade',
  sriov: 'sriov',
};

export const typeLabels = {
  [types.bridge]: t('Bridge'),
  [types.masquerade]: t('Masquerade'),
  [types.sriov]: t('SR-IOV'),
};

export const interfacesTypes = new Proxy(types, typeHandler);
