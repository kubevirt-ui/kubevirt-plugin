import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type NavPageComponentProps = {
  instanceTypeExpandedSpec?: V1VirtualMachine;
  vm: V1VirtualMachine;
};
