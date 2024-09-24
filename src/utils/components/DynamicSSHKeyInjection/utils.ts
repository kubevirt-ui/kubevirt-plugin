import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import {
  convertYAMLUserDataObject,
  getCloudInitVolume,
} from '../CloudinitModal/utils/cloudinit-utils';
import { cmdIsSSHInjection } from '../SSHSecretModal/utils/utils';

export const hasDynamicSSHInjectionCommand = (vm: V1VirtualMachine) => {
  const cloudInitVolume = getCloudInitVolume(vm);
  const userData = convertYAMLUserDataObject(
    cloudInitVolume?.cloudInitNoCloud?.userData || cloudInitVolume?.cloudInitConfigDrive?.userData,
  );

  return !!userData.runcmd?.find(cmdIsSSHInjection);
};
