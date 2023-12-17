import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isBootableVolumePVCKind } from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
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

  const encodedSSHCloudInitUserData = `--cloud-init-user-data ${encodeKeyForVirtctlCommand(
    vm,
    sshPubKey,
  )}`;

  const commandStructure = [
    'virtctl create vm',
    `--name=${getName(vm)}`,
    `--instancetype=${vm?.spec?.instancetype?.name}`,
    `--preference=${vm?.spec?.preference?.name}`,
    `${source}${sourceMetadata}`,
    sshPubKey || null,
    encodedSSHCloudInitUserData,
  ];

  return commandStructure.filter(Boolean).join(` \\\n`);
};
