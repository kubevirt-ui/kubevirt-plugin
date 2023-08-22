import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';

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
  const consoleHostname =
    sshService?.status?.loadBalancer?.ingress?.[0]?.ip || window.location.hostname;

  const { users } = getCloudInitCredentials(vm);
  const user = users?.[0]?.name;
  const sshServicePort = sshService?.spec?.ports?.[0]?.port;

  let command = 'ssh ';

  if (user) command += `${user}@`;

  command += `${consoleHostname} -p ${sshServicePort}`;

  return {
    command,
    sshServiceRunning: Boolean(sshService),
    user,
  };
};

export default useSSHCommand;
