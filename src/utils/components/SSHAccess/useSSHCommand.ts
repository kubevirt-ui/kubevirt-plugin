import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { getSSHNodePort } from '@kubevirt-utils/utils/utils';

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
  const consoleHostname = window.location.hostname; // fallback to console hostname

  const { users } = getCloudInitCredentials(vm);
  const user = users?.[0]?.name;
  const sshServicePort = getSSHNodePort(sshService);

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
