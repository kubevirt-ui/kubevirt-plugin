import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ListPageProps } from '@kubevirt-utils/utils/types';

export type UserInstancetypeListProps = ListPageProps & {
  instanceTypes: V1beta1VirtualMachineInstancetype[];
  loaded: boolean;
  loadError?: unknown;
};
