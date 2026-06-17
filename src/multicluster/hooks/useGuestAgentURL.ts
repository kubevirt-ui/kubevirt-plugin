import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

import useVMISubresourceURL from './useVMISubresourceURL';

const useGuestAgentURL = (vmi: V1VirtualMachineInstance): [string, boolean] =>
  useVMISubresourceURL(vmi, 'guestosinfo');

export default useGuestAgentURL;
