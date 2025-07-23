import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { getCluster } from '@multicluster/helpers/selectors';

type UseVMIForVM = (vm: V1VirtualMachine) => {
  vmi: V1VirtualMachineInstance;
  vmiLoaded: boolean;
  vmiLoadError: Error;
};

const useVMIForVM: UseVMIForVM = (vm) => useVMI(getName(vm), getNamespace(vm), getCluster(vm));

export default useVMIForVM;
