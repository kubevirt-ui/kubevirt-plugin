import { InfrastructureModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { getSSHNodePort } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export type useSSHCommandResult = {
  command: string;
  user: string;
  sshServiceRunning: boolean;
};

const useSSHCommand = (
  vmi: V1VirtualMachineInstance,
  sshService: IoK8sApiCoreV1Service,
): useSSHCommandResult => {
  const [infrastructure, infrastructureLoaded, infrastructureError] = useK8sWatchResource<any>({
    groupVersionKind: modelToGroupVersionKind(InfrastructureModel),
    namespace: vmi?.metadata?.namespace,
    name: 'cluster',
    isList: false,
  });

  const infrastuctureApiUrl =
    infrastructureLoaded && !infrastructureError && infrastructure?.status?.apiServerURL;
  const apiHostname = infrastuctureApiUrl && new URL(infrastuctureApiUrl).hostname;
  const consoleHostname = window.location.hostname; // fallback to console hostname

  const { user } = getCloudInitCredentials(vmi);
  const sshServicePort = getSSHNodePort(sshService);
  const command = `ssh ${user && `${user}@`}${apiHostname || consoleHostname} -p ${sshServicePort}`;

  return {
    command,
    user,
    sshServiceRunning: !!sshService,
  };
};

export default useSSHCommand;
