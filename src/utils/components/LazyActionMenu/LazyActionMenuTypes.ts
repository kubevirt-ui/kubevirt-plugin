import { type Dispatch, type SetStateAction } from 'react';

import {
  type checkAccess as defaultCheckAccess,
  type MenuOption,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  type ActionContext,
  type LazyActionMenuProps,
} from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import { type MenuToggleProps } from '@patternfly/react-core';

export type CheckAccess = typeof defaultCheckAccess;

export type ExtendedLazyActionMenuProps = LazyActionMenuProps & {
  checkAccessDelegate?: CheckAccess;
  disabledTooltip?: string;
  localOptions?: MenuOption[];
  toggleSize?: MenuToggleProps['size'];
};

export type LazyFetchProps = {
  checkAccess: CheckAccess;
  context: ActionContext;
  mergedOptions?: MenuOption[];
  setRemoteOptions: Dispatch<SetStateAction<MenuOption[]>>;
};
