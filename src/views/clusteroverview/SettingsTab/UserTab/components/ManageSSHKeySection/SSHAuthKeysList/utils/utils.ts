import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

import { AuthKeyRow } from './types';

export const createAuthKeyRow: (activeNamespace: string, id?: number) => AuthKeyRow = (
  activeNamespace,
  id,
) => ({
  id: id ?? 0,
  projectName: activeNamespace === ALL_NAMESPACES_SESSION_KEY ? '' : activeNamespace,
  secretName: '',
});
