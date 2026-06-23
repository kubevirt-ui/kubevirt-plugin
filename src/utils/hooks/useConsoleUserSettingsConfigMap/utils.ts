import { sha256 } from 'js-sha256';

import { KUBE_ADMIN_USERNAME, KUBEADMIN_SETTINGS_ID } from './consts';

export const hashUsernameForSettings = (name: string, uid?: string): null | string => {
  if (!name) {
    return null;
  }

  if (name === KUBE_ADMIN_USERNAME && !uid) {
    return KUBEADMIN_SETTINGS_ID;
  }

  return sha256(name);
};
