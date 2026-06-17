import { V1VirtualMachineInstanceFileSystem } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { EXCLUDED_FILESYSTEM_TYPES } from './constants';

export const filterWritableFilesystems = (
  filesystems: V1VirtualMachineInstanceFileSystem[],
): V1VirtualMachineInstanceFileSystem[] =>
  filesystems?.filter((fs) => !EXCLUDED_FILESYSTEM_TYPES.includes(fs?.fileSystemType));
