import type {
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export type PanicDeviceDescriptionItemProps = {
  disabledTooltipText?: string;
  isDisabled?: boolean;
  updatePanicDetection?: (
    checked: boolean,
    panicDeviceModel: string,
  ) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};
