import { ComponentType, ReactNode } from 'react';

import { Extension, ExtensionDeclaration } from '@openshift-console/dynamic-plugin-sdk/lib/types';
import { ITransform } from '@patternfly/react-table';

export const ACM_VM_COLUMN_EXTENSION_ID = 'acm.virtualmachine/list/column';

export type ListColumnExtensionProps = {
  /** component type*/
  cell: ComponentType<{ resource?: any }>;

  cellTransforms?: ITransform[];

  /** the header of the column */
  header: string;

  // By default it is true
  isActionCol?: boolean;

  tooltip?: ReactNode;

  // If it is true, This column always the last one and isn't managed by column management filter
  transforms?: ITransform[];
};

export type ACMVirtualMachineListColumnExtension = ExtensionDeclaration<
  typeof ACM_VM_COLUMN_EXTENSION_ID,
  ListColumnExtensionProps
>;

export const isACMVirtualMachineListColumnExtension = (
  e: Extension,
): e is ACMVirtualMachineListColumnExtension => e.type === ACM_VM_COLUMN_EXTENSION_ID;
