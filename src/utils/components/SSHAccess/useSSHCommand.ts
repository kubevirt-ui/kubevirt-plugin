import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NODE_PORT_ADDRESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { getSSHNodePort } from '@kubevirt-utils/utils/utils';

import { useFeatures } from '../../hooks/useFeatures/useFeatures';

import { SERVICE_TYPES } from './constants';

export type useSSHCommandResult = {
  command: string;
  sshServiceRunning: boolean;
  user: string;
};

// SSH over NodePort
const useSSHCommand = (
  vm: V1VirtualMachine,
  sshService: IoK8sApiCoreV1Service,
): useSSHCommandResult => {
  const { featureEnabled: nodePortAddress } = useFeatures(NODE_PORT_ADDRESS);

  const consoleHostname = () => {
    if (sshService?.spec?.type === SERVICE_TYPES.LOAD_BALANCER) {
      return sshService?.status?.loadBalancer?.ingress?.[0]?.ip;
    }

    if (sshService?.spec?.type === SERVICE_TYPES.NODE_PORT) {
      return nodePortAddress;
    }

    return window.location.hostname; // fallback to console hostname
  };

  const { users } = getCloudInitCredentials(vm);
  const user = users?.[0]?.name;
  const sshServicePort =
    sshService?.spec?.type === SERVICE_TYPES.LOAD_BALANCER
      ? sshService?.spec?.ports?.[0]?.port
      : getSSHNodePort(sshService);

  let command = 'ssh ';

  if (user) command += `${user}@`;

  command += `${consoleHostname()} -p ${sshServicePort}`;

  return {
    command,
    sshServiceRunning: Boolean(sshService),
    user,
  };
};

export default useSSHCommand;
