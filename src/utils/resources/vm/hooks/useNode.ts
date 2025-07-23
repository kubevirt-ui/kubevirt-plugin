import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVMINodeName } from '@kubevirt-utils/resources/vmi';

import useVMIForVM from './useVMIForVM';

type UseNode = (vm: V1VirtualMachine) => string;

const useNode: UseNode = (vm) => {
  const { vmi } = useVMIForVM(vm);
  return getVMINodeName(vmi);
};

export default useNode;
