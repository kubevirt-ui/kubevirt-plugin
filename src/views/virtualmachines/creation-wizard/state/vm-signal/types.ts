import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

type UpdateWizardVMArgs = {
  data: any;
  merge?: boolean;
  path?: string | string[];
}[];

export type UpdateWizardVM = (args: UpdateWizardVMArgs) => V1VirtualMachine;
