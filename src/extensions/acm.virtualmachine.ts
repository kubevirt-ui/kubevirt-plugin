import { ComponentType, ReactNode } from 'react';

import { Extension, ExtensionDeclaration } from '@openshift-console/dynamic-plugin-sdk/lib/types';
import { TooltipProps } from '@patternfly/react-core';
import { ITransform } from '@patternfly/react-table';

// TODO: all ACM extension declarations should be provided by '@stolostron/multicluster-sdk'

export type ACMVirtualMachineListColumn = ExtensionDeclaration<
  'acm.virtualmachine/list/column',
  {
    /** component type */
    cell: ComponentType<{ resource?: any }>;
    cellTransforms?: ITransform[];
    /** the header of the column */
    header: string;
    // By default it is true
    isActionCol?: boolean;
    tooltip?: ReactNode;
    // If it is true, This column always the last one and isn't managed by column management filter
    transforms?: ITransform[];
  }
>;

export type ACMVirtualMachineAction = ExtensionDeclaration<
  'acm.virtualmachine/action',
  {
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
  }
>;

export const isACMVirtualMachineListColumn = (e: Extension): e is ACMVirtualMachineListColumn =>
  e.type === 'acm.virtualmachine/list/column';

export const isACMVirtualMachineAction = (e: Extension): e is ACMVirtualMachineAction =>
  e.type === 'acm.virtualmachine/action';
