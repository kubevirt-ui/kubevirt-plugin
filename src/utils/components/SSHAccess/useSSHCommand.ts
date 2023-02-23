import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { getSSHNodePort } from '@kubevirt-utils/utils/utils';

import { SERVICE_TYPES } from './constants';

export type useSSHCommandResult = {
  command: string;
  user: string;
  sshServiceRunning: boolean;
};

// SSH over NodePort
const useSSHCommand = (
  vm: V1VirtualMachine,
  sshService: IoK8sApiCoreV1Service,
): useSSHCommandResult => {
  const consoleHostname =
    sshService?.spec?.type === SERVICE_TYPES.LOAD_BALANCER
      ? sshService?.status?.loadBalancer?.ingress?.[0]?.ip
      : window.location.hostname; // fallback to console hostname

  const { users } = getCloudInitCredentials(vm);
  const user = users?.[0]?.name;
  const sshServicePort =
    sshService?.spec?.type === SERVICE_TYPES.LOAD_BALANCER
      ? sshService?.spec?.ports?.[0]?.port
      : getSSHNodePort(sshService);

  let command = 'ssh ';

  if (user) command += `${user}@`;

  command += `${consoleHostname} -p ${sshServicePort}`;

  return {
    command,
    user,
    sshServiceRunning: Boolean(sshService),
  };
};

export default useSSHCommand;
