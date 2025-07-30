import { ComponentType, ReactNode } from 'react';

import { ExtensionDeclaration } from '@openshift-console/dynamic-plugin-sdk/lib/types';
import { TooltipProps } from '@patternfly/react-core';

export const ACM_ACTION_EXTENSION_ID = 'acm.virtualmachine/action';

export type ACMActionExtensionProps = {
  /** Inject a separator horizontal rule immediately before an action */
  addSeparator?: boolean;
  /** Modal component type*/
  component: ComponentType<{
    close: () => void;
    cluster?: string;
    isOpen: boolean;
    resource?: any;
  }>;
  /** Display a description for this action */
  description?: string;
  /** Action identifier */
  id: string;
  /** Display an action as being ariaDisabled */
  isAriaDisabled?: boolean;
  /** Display an action as being disabled */
  isDisabled?: (resource: any) => boolean;
  /** For application, default action type is OpenShift*/
  model?: {
    apiVersion: string;
    kind: string;
  }[];
  /** Visible text for action */
  title: ReactNode | string;
  /** Display action for this GVK type */
  /** Display a tooltip for this action */
  tooltip?: string;
  /** Additional tooltip props forwarded to tooltip component */
  tooltipProps?: Partial<TooltipProps>;
};

export type ACMVirtualMachineActionExtension = ExtensionDeclaration<
  typeof ACM_ACTION_EXTENSION_ID,
  ACMActionExtensionProps
>;
