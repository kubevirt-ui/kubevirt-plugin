import React from 'react';

import TechPreviewBadge from '@kubevirt-utils/components/TechPreviewBadge/TechPreviewBadge';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const PASST_BINDING = 'passt-binding';
export const L2BRIDGE_BINDING = 'l2bridge-binding';

export const BINDING_SELECT_TITLE = {
  [L2BRIDGE_BINDING]: 'bridge',
  [PASST_BINDING]: (
    <>
      {t('Passt')} <TechPreviewBadge />
    </>
  ),
};

export const BINDING_SELECT_DESCRIPTION = {
  [L2BRIDGE_BINDING]: t(
    'The default binding. Extend the L2 domain of the user-defined network into the VirtualMachine',
  ),
  [PASST_BINDING]: t(
    'User-space network binding offering a better integration with virtctl ssh and port-forward, network probes, and observability.',
  ),
};
