import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { isBootableVolumePVCKind } from '@catalog/CreateFromInstanceTypes/utils/utils';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { encodeKeyForVirtctlCommand } from '@kubevirt-utils/resources/secret/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

export const getCreateVMVirtctlCommand = (
  vm: V1VirtualMachine,
  selectedBootableVolume: BootableVolume,
  sshPubKey: string,
): string => {
  const sourceMetadata = `${getNamespace(selectedBootableVolume)}/${getName(
    selectedBootableVolume,
  )}`;

  const source = isBootableVolumePVCKind(selectedBootableVolume)
    ? '--volume-clone-pvc='
    : '--volume-datasource=src:';

  const encodedSSHCloudInitUserData =
    sshPubKey && `--cloud-init-user-data ${encodeKeyForVirtctlCommand(sshPubKey)}`;

  return `virtctl create vm \\
  --name=${getName(vm)} \\
  --instancetype=${vm?.spec?.instancetype?.name} \\
  --preference=${vm?.spec?.preference?.name} \\
  ${source}${sourceMetadata} ${sshPubKey && '\\'}
  ${encodedSSHCloudInitUserData}`;
};
