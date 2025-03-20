import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Fleet } from '@stolostron/multicluster-sdk';

export type NavPageComponentProps = {
  instanceTypeExpandedSpec?: V1VirtualMachine;
  obj: Fleet<V1VirtualMachine>;
};
