import { ExtensionDeclaration } from '@openshift-console/dynamic-plugin-sdk/lib/types';
import { TooltipProps } from '@patternfly/react-core';

export const ACTIONS_ID = {
  DELETE: 'selected-vms-action-delete',
  EDIT_LABELS: 'selected-vms-action-edit-labels',
  MOVE_TO_FOLDER: 'selected-vms-action-move-to-folder',
  PAUSE: 'selected-vms-action-pause',
  RESTART: 'selected-vms-action-restart',
  START: 'selected-vms-action-start',
  STOP: 'selected-vms-action-stop',
  UNPAUSE: 'selected-vms-action-unpause',
};

export type ACMActionExtensionProps = {
  /** Inject a separator horizontal rule immediately before an action */
  addSeparator?: boolean;
  /** Modal component type*/
  component: React.ComponentType<{
    close: () => void;
    cluster?: string;
    isOpen: boolean;
    resource?: any;
  }>;
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
  title: React.ReactNode | string;
  /** Display action for this GVK type */
  /** Display a tooltip for this action */
  tooltip?: string;
  /** Additional tooltip props forwarded to tooltip component */
  tooltipProps?: Partial<TooltipProps>;
};

export type ACMVirtualMachineActionExtension = ExtensionDeclaration<
  'acm.virtualmachine/action',
  ACMActionExtensionProps
>;
