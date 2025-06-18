import { Extension, ExtensionDeclaration } from '@openshift-console/dynamic-plugin-sdk/lib/types';
import { ITransform } from '@patternfly/react-table';

export type ListColumnExtensionProps = {
  /** component type*/
  cell: React.ComponentType<{ resource?: any }>;

  cellTransforms?: ITransform[];

  /** the header of the column */
  header: string;

  // By default it is true
  isActionCol?: boolean;

  tooltip?: React.ReactNode;

  // If it is true, This column always the last one and isn't managed by column management filter
  transforms?: ITransform[];
};

export type ACMVirtualMachineListColumnExtension = ExtensionDeclaration<
  'acm.virtualmachine/list/column',
  ListColumnExtensionProps
>;

export const isACMVirtualMachineListColumnExtension = (
  e: Extension,
): e is ACMVirtualMachineListColumnExtension => e.type === 'acm.virtualmachine/list/column';
