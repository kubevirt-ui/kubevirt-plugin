import type { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import type { ListPageProps } from '@kubevirt-utils/utils/types';

export type UserInstancetypeListProps = ListPageProps & {
  instanceTypes: V1beta1VirtualMachineInstancetype[];
  loaded: boolean;
  loadError?: unknown;
};
