import { TFunction } from 'i18next';

import { AlertVariant } from '@patternfly/react-core';

import { ToastOptions } from './types';

export const getToastVariantDefaults = (t: TFunction): Record<string, Partial<ToastOptions>> => {
  const drawerGroup = t('Virtualization');

  return {
    [AlertVariant.danger]: {
      dismissible: true,
      drawerGroup,
      persistInDrawer: true,
      timeout: false,
    },
    [AlertVariant.info]: {
      dismissible: true,
      drawerGroup,
      persistInDrawer: true,
      timeout: true,
    },
    [AlertVariant.success]: {
      dismissible: true,
      drawerGroup,
      persistInDrawer: true,
      timeout: true,
    },
    [AlertVariant.warning]: {
      dismissible: true,
      drawerGroup,
      persistInDrawer: true,
      timeout: false,
    },
  };
};
